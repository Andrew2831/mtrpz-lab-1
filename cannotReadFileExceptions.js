import { AbstractError } from "@stlib/utils";

export class CannotReadFileException extends AbstractError {
  constructor() {
    super('Cannot read or open specified file.');
  }
}
