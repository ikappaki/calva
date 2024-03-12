import * as outputWindow from './results-doc';
import * as config from '../config';
import * as vscode from 'vscode';

export interface AfterAppendCallback {
  (insertLocation: vscode.Location, newPosition?: vscode.Location): any;
}

let outputChannel: vscode.OutputChannel;
function initOutputChannel() {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Calva Results', 'markdown');
  }
}

export type OutputDestination = 'output-window' | 'output-channel';

export type OutputDestinationConfiguration = {
  evalResults: OutputDestination;
  evalOutput: OutputDestination;
  otherOutput: OutputDestination;
};

export const defaultDestinationConfiguration: OutputDestinationConfiguration = {
  evalResults: 'output-channel',
  evalOutput: 'output-channel',
  otherOutput: 'output-channel',
};

function getDestinationConfiguration(): OutputDestinationConfiguration {
  return config.getConfig().outputDestinations || defaultDestinationConfiguration;
}

function asClojureLineComments(message: string) {
  return message
    .split('\n')
    .map((line) => `; ${line}`)
    .join('\n');
}

// Used to decide if new output result output should be prepended with a newline or not.
// Also: For non-result output, the repl window output should be be printed as line comments.
const didLastOutputTerminateLine = {
  'output-window': true,
  'output-channel': true,
};

function appendClojure(
  destination: OutputDestination,
  message: string,
  after?: AfterAppendCallback
) {
  const didLastTerminateLine = didLastOutputTerminateLine[destination];
  didLastOutputTerminateLine[destination] = true;
  if (destination === 'output-window') {
    outputWindow.append(`${didLastTerminateLine ? '' : '\n'}${message}\n`, after);
    return;
  }
  if (destination === 'output-channel') {
    initOutputChannel();
    outputChannel.append((didLastTerminateLine ? '' : '\n') + '```clojure\n' + message + '\n```\n');
    return;
  }
}

/**
 * Appends evaluation related Clojure code.
 * Prepending with newline if last output did not end with a newline.
 * Fencing in a `clojure` markdown block if destination is `output-channel`.
 * @param code The code to append
 * @param after Optional callback to run after the append
 */
export function appendClojureEval(code: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().evalResults;
  appendClojure(destination, code, after);
}

/**
 * Appends evaluation related Clojure code.
 * Prepending with newline if last output did not end with a newline.
 * Fencing in a `clojure` markdown block if destination is `output-channel`.
 * @param code The code to append
 * @param after Optional callback to run after the append
 */
export function appendClojureOther(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().otherOutput;
  appendClojure(destination, message, after);
}

function append(destination: OutputDestination, message: string, after?: AfterAppendCallback) {
  const didLastTerminateLine = didLastOutputTerminateLine[destination];
  didLastOutputTerminateLine[destination] = message.endsWith('\n');
  if (destination === 'output-window') {
    outputWindow.append(
      `${didLastTerminateLine ? '; ' : ''}${asClojureLineComments(message)}`,
      after
    );
    return;
  }
  if (destination === 'output-channel') {
    initOutputChannel();
    outputChannel.append(message);
    return;
  }
}

/**
 * Appends output without adding a newline at the end.
 * Use for stdout messages related to an evaluation
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendEvalOut(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().evalOutput;
  append(destination, message, after);
}

/**
 * Appends output without adding a newline at the end.
 * Use for stderr messages related to an evaluation
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendEvalErr(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().evalOutput;
  append(destination, message, after);
}

/**
 * Appends output without adding a newline at the end.
 * Use for stdout and other messages not related to an evaluation
 * (e.g. out of band messages)
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendOtherOut(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().otherOutput;
  append(destination, message, after);
}

/**
 * Appends output without adding a newline at the end.
 * Use for stderr and other error messages not related to an evaluation
 * (e.g. out of band messages)
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendOtherErr(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().otherOutput;
  append(destination, message, after);
}

function appendLine(destination: OutputDestination, message: string, after?: AfterAppendCallback) {
  const didLastTerminateLine = didLastOutputTerminateLine[destination];
  didLastOutputTerminateLine[destination] = true;
  if (destination === 'output-window') {
    outputWindow.appendLine(
      `${didLastTerminateLine ? '; ' : ''}${asClojureLineComments(message)}`,
      after
    );
    return;
  }
  if (destination === 'output-channel') {
    initOutputChannel();
    outputChannel.appendLine(message);
    return;
  }
}

/**
 * Appends output adding a newline at the end.
 * Use for stdout messages related to an evaluation
 * (Maybe there is no use case for this even, as all eval output already should have any newlines needed)
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendLineEvalOut(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().evalOutput;
  appendLine(destination, message, after);
}

/**
 * Appends output adding a newline at the end.
 * Use for stderr messages related to an evaluation
 * (Maybe there is no use case for this even, as all eval output already should have any newlines needed)
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendLineEvalErr(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().evalOutput;
  appendLine(destination, message, after);
}

/**
 * Appends output adding a newline at the end.
 * Use for stdout and other messages not related to an evaluation
 * (e.g. out of band messages)
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendLineOtherOut(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().otherOutput;
  appendLine(destination, message, after);
}

/**
 * Appends output adding a newline at the end.
 * Use for stderr and other error messages not related to an evaluation
 * (e.g. out of band messages)
 * @param message The message to append
 * @param after Optional callback to run after the append
 */
export function appendLineOtherErr(message: string, after?: AfterAppendCallback) {
  const destination = getDestinationConfiguration().otherOutput;
  appendLine(destination, message, after);
}
