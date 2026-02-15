import { test } from '@playwright/test';

/**
 * Modern TypeScript 5+ decorator for automatically wrapping page object methods with test.step()
 *
 * Features:
 * - Uses modern decorator API (ClassMethodDecoratorContext)
 * - Automatically generates step names from class and method names
 * - Supports custom step names with parameter injection using {paramName} syntax
 * - Uses boxing ({ box: true }) for better error reporting
 * - Errors point to the step call site rather than inside the step
 *
 * @param customName - Optional custom step name. Use {paramName} to inject parameter values
 *
 * @example
 * // Automatic step name: "HomePage.navigate"
 * @step
 * async navigate() { ... }
 *
 * @example
 * // Custom step name with parameter injection: "Select category: Electronics"
 * @step('Select category: {category}')
 * async selectCategory(category: string) { ... }
 */
export function step(customName?: string) {
  return function (target: Function, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);

    return function replacementMethod(this: any, ...args: any[]) {
      // Build step name
      const className = this.constructor.name;
      let stepName: string;

      if (customName) {
        // Custom step name with parameter injection
        stepName = injectParameters(customName, target, args);
      } else {
        // Default: ClassName.methodName
        stepName = `${className}.${methodName}`;
      }

      // Execute in test.step with boxing enabled for better error reporting
      return test.step(stepName, async () => {
        return await target.call(this, ...args);
      }, { box: true });
    };
  };
}

/**
 * Extract parameter names from a function
 */
function extractParameterNames(fn: Function): string[] {
  const fnString = fn.toString();

  // Match function parameters - handles both regular and arrow functions
  const match = fnString.match(/\(([^)]*)\)/) || fnString.match(/^([^=]*?)=>/);

  if (!match || !match[1]?.trim()) {
    return [];
  }

  return match[1]
    .split(',')
    .map(param => param.trim().split(/[=:]/)[0].trim())
    .filter(Boolean);
}

/**
 * Replace placeholders like {paramName} with actual argument values
 */
function injectParameters(template: string, fn: Function, args: any[]): string {
  const paramNames = extractParameterNames(fn);
  let result = template;

  paramNames.forEach((paramName, index) => {
    const placeholder = `{${paramName}}`;
    const value = args[index];

    // Format the value for display
    let displayValue: string;
    if (value === undefined || value === null) {
      displayValue = String(value);
    } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value);
    } else {
      displayValue = String(value);
    }

    result = result.replace(new RegExp(placeholder, 'g'), displayValue);
  });

  return result;
}
