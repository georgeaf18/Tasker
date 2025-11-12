module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Disable default scope rules to allow custom validation
    'scope-case': [0],
    'scope-empty': [0],

    // Disable body/footer line length for Claude Code compatibility
    'body-max-line-length': [0],
    'footer-max-line-length': [0],

    // Custom rule: TASK reference required in scope
    'task-in-scope': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'task-in-scope': ({ scope }) => {
          if (!scope) {
            return [
              false,
              'Scope is required and must contain TASK-<number>\n' +
              'Format: <type>(TASK-123): <description>\n' +
              'Example: feat(TASK-123): add user authentication'
            ];
          }

          const regex = /TASK-\d+/;
          if (!regex.test(scope)) {
            return [
              false,
              'Scope must contain TASK-<number> reference\n' +
              'Format: <type>(TASK-123): <description>\n' +
              'Example: feat(TASK-123): add user authentication'
            ];
          }

          return [true];
        },
      },
    },
  ],
};
