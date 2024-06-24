import { AbstractError } from "@stlib/utils";

export class WrongSytaxException extends AbstractError {
  constructor(mesage) {
    super('Wrong markdown syntax | ', mesage);
  }
}
