import cdk = require('@aws-cdk/cdk');
import { CatchProps, Errors, IChainable, IStateChain, RenderedStateMachine, RetryProps } from './asl-external-api';
import { IInternalState } from './asl-internal-api';

export class StateChain implements IStateChain {
    private allStates = new Set<IInternalState>();
    private activeStates = new Set<IInternalState>();
    private _startState: IInternalState;

    constructor(startState: IInternalState) {
        this.allStates.add(startState);

        // Even if the state doesn't allow .next()ing onto it, still set as
        // active state so we trigger the per-State exception (which is more
        // informative than the generic "no active states" exception).
        this.activeStates.add(startState);

        this._startState = startState;
    }

    public get startState(): IInternalState {
        return this._startState;
    }

    public next(state: IChainable): IStateChain {
        const sm = state.toStateChain();

        const ret = this.clone();

        if (this.activeStates.size === 0) {
            throw new Error('Cannot add to chain; there are no chainable states without a "Next" transition.');
        }

        for (const endState of this.activeStates) {
            endState.addNext(sm);
        }

        ret.absorb(sm);
        ret.activeStates = new Set(accessChainInternals(sm).activeStates);

        return ret;
    }

    public toStateChain(): IStateChain {
        return this;
    }

    public onError(handler: IChainable, props: CatchProps = {}): IStateChain {
        if (!props.errors) {
            props.errors = [Errors.all];
        }

        const sm = handler.toStateChain();

        const canApplyDirectly = Array.from(this.allStates).every(s => s.canHaveCatch);
        if (!canApplyDirectly) {
            // Can't easily create a Parallel here automatically since we need a
            // StateMachineDefinition parent and need to invent a unique name.
            throw new Error('Chain contains non-Task, non-Parallel actions. Wrap this in a Parallel to catch errors.');
        }

        const ret = this.clone();
        for (const state of this.allStates) {
            state.addCatch(sm, props);
        }

        // Those states are now part of the state machine, but we don't include
        // their active ends.
        ret.absorb(sm);

        return ret;
    }

    /**
     * Return a closure that contains all accessible states from the given start state
     *
     * This sets all active ends to the active ends of all accessible states.
     */
    public closure(): IStateChain {
        const ret = new StateChain(this.startState);

        const queue = this.startState.accessibleChains();
        while (queue.length > 0) {
            const chain = queue.splice(0, 1)[0];
            for (const state of accessChainInternals(chain).allStates) {
                if (!ret.allStates.has(state)) {
                    ret.allStates.add(state);
                    queue.push(...state.accessibleChains());
                }
            }
        }

        ret.activeStates = new Set(Array.from(ret.allStates).filter(s => s.hasOpenNextTransition));

        return ret;
    }

    public renderStateMachine(): RenderedStateMachine {
        // Rendering always implies rendering the closure
        const closed = this.closure();

        const policies = new Array<cdk.PolicyStatement>();

        const states: any = {};
        for (const state of accessChainInternals(closed).allStates) {
            states[state.stateId] = state.renderState();
            policies.push(...state.policyStatements);
        }

        return {
            stateMachineDefinition: {
                StartAt: this.startState.stateId,
                States: states
            },
            policyStatements: policies
        };
    }

    public defaultRetry(retry: RetryProps = {}): IStateChain {
        for (const state of this.allStates) {
            state.addRetry(retry);
        }
        return this;
    }

    public absorb(other: IStateChain) {
        const sdm = accessChainInternals(other);
        for (const state of sdm.allStates) {
            this.allStates.add(state);
        }
    }

    private clone(): StateChain {
        const ret = new StateChain(this.startState);
        ret.allStates = new Set(this.allStates);
        ret.activeStates = new Set(this.activeStates);
        return ret;
    }
}

/**
 * Access private parts of the state machine definition
 *
 * Parts that we don't want to show to the consumers because they'll
 * only distract, but parts that other states need to achieve their
 * work.
 */
export function accessChainInternals(x: IStateChain): StateChain {
    return x as StateChain;
}