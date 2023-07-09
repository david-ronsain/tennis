import { ValidationError } from 'class-validator';
import { HttpError } from 'routing-controllers';

export class InvalidRequestError extends HttpError {
  validationFailed: string[];
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const msg: string[] = [];
    errors.forEach((error) => {
      if (Array.isArray(error.children) && error.children.length) {
        error.children.forEach((child) => {
          if (typeof child.constraints === 'object')
            msg.push(...Object.values(child.constraints));
        });
      } else if (typeof error.constraints === 'object')
        msg.push(...Object.values(error.constraints));
    });

    super(400, msg.join('\n'));
    this.validationFailed = msg;
  }
}
