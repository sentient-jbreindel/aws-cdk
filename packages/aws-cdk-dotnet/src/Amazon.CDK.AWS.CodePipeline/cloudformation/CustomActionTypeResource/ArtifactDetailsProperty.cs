using Amazon.CDK;
using AWS.Jsii.Runtime.Deputy;

namespace Amazon.CDK.AWS.CodePipeline.cloudformation.CustomActionTypeResource
{
    /// <remarks>link: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-codepipeline-customactiontype-artifactdetails.html </remarks>
    public class ArtifactDetailsProperty : DeputyBase, IArtifactDetailsProperty
    {
        /// <summary>``CustomActionTypeResource.ArtifactDetailsProperty.MaximumCount``</summary>
        /// <remarks>link: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-codepipeline-customactiontype-artifactdetails.html#cfn-codepipeline-customactiontype-artifactdetails-maximumcount </remarks>
        [JsiiProperty("maximumCount", "{\"union\":{\"types\":[{\"primitive\":\"number\"},{\"fqn\":\"@aws-cdk/cdk.Token\"}]}}", true)]
        public object MaximumCount
        {
            get;
            set;
        }

        /// <summary>``CustomActionTypeResource.ArtifactDetailsProperty.MinimumCount``</summary>
        /// <remarks>link: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-codepipeline-customactiontype-artifactdetails.html#cfn-codepipeline-customactiontype-artifactdetails-minimumcount </remarks>
        [JsiiProperty("minimumCount", "{\"union\":{\"types\":[{\"primitive\":\"number\"},{\"fqn\":\"@aws-cdk/cdk.Token\"}]}}", true)]
        public object MinimumCount
        {
            get;
            set;
        }
    }
}