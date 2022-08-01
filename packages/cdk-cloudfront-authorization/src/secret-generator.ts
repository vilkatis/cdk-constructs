import * as path from 'path';
import { Code, SingletonFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CustomResource } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface SecretGeneratorProps {
  readonly length?: number;
  readonly allowedCharacters?: string;
}

export class SecretGenerator extends Construct {
  public readonly secret: string;

  constructor(scope: Construct, id: string, props: SecretGeneratorProps = {}) {
    super(scope, id);

    const secretGenerator = new SingletonFunction(this, 'Function', {
      uuid: 'cloudcomponents-cdk-cloudfront-authorization-secret-generator',
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'secret-generator')),
    });

    const cr = new CustomResource(this, 'CustomResource', {
      serviceToken: secretGenerator.functionArn,
      resourceType: 'Custom::GenerateSecret',
      properties: {
        Length: props.length ?? 16,
        AllowedCharacters: props.allowedCharacters ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~',
      },
    });

    this.secret = cr.ref;
  }
}
