/**
 * CDK Stack for Flutter Frontend
 * 
 * This file should be copied to pricofy-infra/lib/frontend-flutter-stack.ts
 * and imported in pricofy-infra/bin/infra.ts
 * 
 * Instructions:
 * 1. Copy this file to: pricofy-infra/lib/frontend-flutter-stack.ts
 * 2. In pricofy-infra/bin/infra.ts, add:
 *    import { FrontendFlutterStack } from '../lib/frontend-flutter-stack';
 *    new FrontendFlutterStack(app, 'Pricofy-Frontend-Flutter');
 * 3. Deploy: cd pricofy-infra && npx cdk deploy Pricofy-Frontend-Flutter
 */

import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FrontendFlutterStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for Flutter web build
    this.bucket = new s3.Bucket(this, 'FlutterFrontendBucket', {
      bucketName: 'pricofy-frontend-flutter',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false, // CloudFront will access via OAI
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'FlutterOAI',
      {
        comment: 'OAI for Pricofy Flutter Frontend',
      }
    );

    // Grant CloudFront read access to S3 bucket
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(
      this,
      'FlutterDistribution',
      {
        comment: 'Pricofy Flutter Frontend Distribution',
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new origins.S3Origin(this.bucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5),
          },
        ],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
        enabled: true,
        httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Bucket for Flutter frontend',
      exportName: 'PricofyFlutterBucketName',
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.bucket.bucketArn,
      description: 'S3 Bucket ARN',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: 'PricofyFlutterDistributionId',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Domain Name',
      exportName: 'PricofyFlutterDistributionDomain',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Flutter Web App URL',
    });

    // Add tags
    cdk.Tags.of(this).add('Project', 'Pricofy');
    cdk.Tags.of(this).add('Environment', 'Production');
    cdk.Tags.of(this).add('Frontend', 'Flutter');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}

