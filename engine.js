'format cjs';

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var chalk = require('chalk');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

var filter = function (array) {
  return array.filter(function (x) {
    return x;
  });
};

var headerLength = function (answers) {
  return (
    answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0)
  );
};

var maxSummaryLength = function (options, answers) {
  return options.maxHeaderWidth - headerLength(answers);
};

var filterSubject = function (subject, disableSubjectLowerCase) {
  subject = subject.trim();
  if (
    !disableSubjectLowerCase &&
    subject.charAt(0).toLowerCase() !== subject.charAt(0)
  ) {
    subject =
      subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
  }
  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1);
  }
  return subject;
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {
  var types = options.types;
  var length = longest(Object.keys(types)).length + 1;
  writeFileSync(
    resolve(__dirname, './src/options.json'),
    JSON.stringify(options),
    { encoding: 'utf-8' }
  );
  var choices = map(types, function (type) {
    return {
      name: (type.title + ':').padEnd(length) + ' ' + type.description,
      value: type.title,
    };
  });
  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function (cz, commit) {
      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: chalk.blue(
            "Select the type of change that you're committing:"
          ),
          choices: choices,
          default: options.defaultType,
        },
        {
          type: 'input',
          name: 'scope',
          message:
            'What is the scope of this change (e.g. component or file name): (press enter to skip)',
          default: options.defaultScope,
          filter: function (value) {
            return options.disableScopeLowerCase
              ? value.trim()
              : value.trim().toLowerCase();
          },
        },
        {
          type: 'input',
          name: 'subject',
          message: function (answers) {
            return (
              'Write a short, imperative tense description of the change (max ' +
              maxSummaryLength(options, answers) +
              ' chars):\n'
            );
          },
          default: options.defaultSubject,
          validate: function (subject, answers) {
            var filteredSubject = filterSubject(
              subject,
              options.disableSubjectLowerCase
            );
            return filteredSubject.length == 0
              ? 'subject is required'
              : filteredSubject.length <= maxSummaryLength(options, answers)
              ? true
              : 'Subject length must be less than or equal to ' +
                maxSummaryLength(options, answers) +
                ' characters. Current length is ' +
                filteredSubject.length +
                ' characters.';
          },
          transformer: function (subject, answers) {
            var filteredSubject = filterSubject(
              subject,
              options.disableSubjectLowerCase
            );
            var color =
              filteredSubject.length <= maxSummaryLength(options, answers)
                ? chalk.green
                : chalk.red;
            return color('(' + filteredSubject.length + ') ' + subject);
          },
          filter: function (subject) {
            return filterSubject(subject, options.disableSubjectLowerCase);
          },
        },
        {
          type: 'input',
          name: 'body',
          message:
            'Provide a longer description of the change: (press enter to skip)\n',
          default: options.defaultBody,
        },
        {
          type: 'list',
          name: 'isBreaking',
          message: chalk.red('Are there any breaking changes?'),
          choices: ['No', 'Yes'],
          filter: function (input) {
            return input.includes('Yes') ? true : false;
          },
        },
        {
          type: 'input',
          name: 'breakingBody',
          default: '-',
          message:
            'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself:\n',
          when: function (answers) {
            return answers.isBreaking && !answers.body;
          },
          validate: function (breakingBody) {
            return (
              breakingBody.trim().length > 0 ||
              chalk.red('Body is required for BREAKING CHANGE')
            );
          },
        },
        {
          type: 'input',
          name: 'breaking',
          message: 'Describe the breaking changes:\n',
          when: function (answers) {
            return answers.isBreaking;
          },
        },
        {
          type: 'list',
          name: 'isIssueAffected',
          message: 'Does this change affect any open issues?',
          default: options.defaultIssues ? true : false,
          choices: ['No', 'Yes'],
          filter: function (input) {
            return input.includes('Yes') ? true : false;
          },
        },
        {
          type: 'input',
          name: 'issuesBody',
          default: '-',
          message:
            'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
          when: function (answers) {
            return (
              answers.isIssueAffected && !answers.body && !answers.breakingBody
            );
          },
        },
        {
          type: 'input',
          name: 'issues',
          message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
          when: function (answers) {
            return answers.isIssueAffected;
          },
          default: options.defaultIssues ? options.defaultIssues : undefined,
        },
      ]).then(function (answers) {
        var wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth,
        };

        // parentheses are only needed when a scope is present
        var scope = answers.scope ? '(' + answers.scope + ')' : '';

        // Add a expolaration mark if this commit has marked as BREAKING CHANGE
        var colon = answers.isBreaking ? '!：' : '：';

        // Hard limit this line in the validate
        var head = answers.type + scope + colon + answers.subject;

        // Wrap these lines at options.maxLineWidth characters.
        // Also, fill the body with breakingBody only if the body is missing.
        var body = answers.body
          ? wrap(answers.body, wrapOptions)
          : wrap(answers.breakingBody, wrapOptions);

        // Apply breaking change prefix, removing it if already present
        var breaking = answers.breaking ? answers.breaking.trim() : '';
        breaking = breaking
          ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
          : '';

        breaking = breaking ? wrap(breaking, wrapOptions) : false;

        var issues = answers.issues ? wrap(answers.issues, wrapOptions) : false;

        if (options.showConfirmPrompt)
          confirmPrompt({ head, body, breaking, issues }, cz, commit);
        else commit(filter([head, body, breaking, issues]).join('\n\n'));
      });
      function confirmPrompt(parts, cz, commit) {
        const { head, body, breaking, issues } = parts;
        const message = filter([head, body, breaking, issues]).join('\n\n');
        const TITLE = ' Your commit messsage is 👇 ';

        const header = insertStr(
          divider(message.length),
          message.length / 2,
          TITLE
        );
        const footer = divider(message.length + TITLE.length);
        console.clear();
        console.log(chalk.green(header));
        newLine();
        console.log(`${message}`);
        newLine();
        console.log(chalk.green(footer));

        cz.prompt([
          {
            type: 'list',
            name: 'continue',
            message: chalk.yellow('Shall we continue?'),
            choices: ['Yes', 'No'],
            filter: (input) => (input === 'Yes' ? true : false),
          },
        ])
          .then((answer) => {
            if (answer.continue) return commit(message);
            else return process.exit(0);
          })
          .catch(() => {
            console.warn(
              chalk.yellow('[cz-translated-changelog-en-us]: commit canceled')
            );
            return process.exit(0);
          });
      }

      function divider(length, str = '') {
        if (str.length < length) return divider(length, str.concat('-'));
        else return str;
      }

      function insertStr(source, at, plugin) {
        return source.slice(0, at).concat(plugin).concat(source.slice(at));
      }

      function newLine() {
        return console.log('\n');
      }
    },
  };
};
