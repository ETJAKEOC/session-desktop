# Contributor Guidelines

## Advice for new contributors

Start small. The PRs most likely to be merged are the ones that make small,
easily reviewed changes with clear and specific intentions.

[Guidelines on Pull Requests](#pull-requests).

It's a good idea to gauge interest in your intended work by finding the current issue
for it or creating a new one yourself. Use Github issues as a place to signal
your intentions and get feedback from the users most likely to appreciate your changes.

You're most likely to have your pull request accepted if it addresses an existing Github issue marked with the [good-first-issue](https://github.com/session-foundation/session-desktop/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) tag, these issues are specifically tagged, because they are generally features/bug fixes which can be cleanly merged on a single platform without requiring cross platform work, are generally of lower complexity than larger features and are non contentious, meaning that the core team doesn't need to try and assess the community desire for such a feature before merging.

Of course we encourage community developers to work on ANY issue filed on our Github regardless of how it’s tagged, however if you pick up or create an issue without the “Good first issue” tag it would be best if you leave a comment on the issue so that the core team can give you any guidance required, especially around UI heavy features or issues which require cross platform integration.

## Developer Setup Tips

## Node.js

You'll need a [Node.js](https://nodejs.org/) version which matches our current version. You can check [`.nvmrc` in the `unstable` branch](https://github.com/session-foundation/session-desktop/blob/unstable/.nvmrc) to see what the current version is.

If you use other node versions you might have or need a node version manager.

- [nvm](https://github.com/creationix/nvm) - you can run `nvm use` in the project directory and it will use the node version specified in `.nvmrc`.
- Some node version management tools can read from the `.nvmrc` file and automatically make the change. If you use [asdf](https://asdf-vm.com/) you can make a [config change](https://asdf-vm.com/guide/getting-started.html#using-existing-tool-version-files) to support the `.nvmrc` file.
- We use [Yarn Classic](https://classic.yarnpkg.com) as our package manager. You can install it by running `npm install --global yarn`.

## Python

You will need a [Python](https://www.python.org) version which matches our current version. You can check [`.tool-versions` in the `unstable` branch](https://github.com/session-foundation/session-desktop/blob/unstable/.tool-versions) to see what the current version is.

If you use other python versions you might have or need a python version manager.

- [asdf](https://asdf-vm.com/) - you can run `asdf install` in the project directory and it will use the python version specified in `.tool-versions`.

> [!WARNING]
> The package [setuptools](https://pypi.org/project/setuptools/) was removed in Python 3.12, so you'll need to install it manually.

```sh
pip install setuptools
```

## Platform Specific Instructions

### Linux

- Install the required build tools for your operating system

  <details>
  <summary>Debian/Ubuntu</summary>

  This will install `make`, `g++`, `gcc`, etc.

  ```sh
  sudo apt install build-essential cmake
  ```

  </details>

  <details>
  <summary>Fedora</summary>

  ```sh
  sudo dnf install make automake gcc gcc-c++ kernel-devel
  ```

  </details>

- Depending on your distribution, you might need to install [hunspell](https://github.com/hunspell/hunspell) and your specific locale (`hunspell-<lang>`) e.g. `hunspell-en-au`.

- Install [Node.JS](https://nodejs.org/en/download/)

  We recommend using [nvm](https://github.com/creationix/nvm) or [asdf](https://asdf-vm.com/).

  You can get the current `<version>` from the [`.nvmrc`](.nvmrc).

- Verify your [Python](https://www.python.org/downloads/) version.

  Most modern Linux distributions should come with Python 3 pre-installed.

  It should be equal to or greater than the version specified in the [`.tool-versions`](.tool-versions).

- Install [setuptools](https://pypi.org/project/setuptools/).

  ```sh
  pip install setuptools
  ```

- Install [Yarn Classic](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

  ```sh
  npm install --global yarn
  ```

### macOS

- Install the [Xcode Command-Line Tools](http://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/).

  **Optional:** Install [Homebrew](https://brew.sh/).

- Install [Git](https://git-scm.com/download/mac).

  We recommend using Homebrew to install Git.

  ```sh
    brew install git
  ```

  After installing Git, you may need to disable `core.autocrlf` to prevent line ending issues.

  ```sh
  git config --local core.autocrlf false
  ```

- Install [Node.JS](https://nodejs.org/en/download/)

  We recommend using [nvm](https://github.com/creationix/nvm) or [asdf](https://asdf-vm.com/).

  You can get the current `<version>` from the [`.nvmrc`](.nvmrc).

- Install [Python](https://www.python.org/downloads/)

  We recommend using [asdf](https://asdf-vm.com/).

  You can get the current `<version>` from the [`.tool-versions`](.tool-versions).

- Install [setuptools](https://pypi.org/project/setuptools/).

  ```sh
  pip install setuptools
  ```

- Install [Yarn Classic](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

  ```sh
  npm install --global yarn
  ```

### Windows

Building on Windows can be a bit tricky. You can set this up manually, but we recommend using [Chocolatey](https://chocolatey.org/) to install the necessary dependencies.

The following instructions will install the following:

- [Git](https://git-scm.com/download/win)
- [CMake](https://cmake.org/download/)
- [Visual Studio 2022](https://visualstudio.microsoft.com/downloads/)
- [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [Node.js](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)

Setup instructions for Windows using Chocolatey:

- Open PowerShell as Administrator

- Install [Chocolatey](https://docs.chocolatey.org/en-us/choco/setup#installing-chocolatey-cli)

  ```PowerShell
  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
  ```

> [!WARNING]
> Make sure to read the Chocolatey output for each `choco install` step.
> It will tell you if you need to restart your terminal or computer.
> If you don't do this, you may encounter issues with the next steps.

- Install [Git](https://git-scm.com/download/win)

  ```sh
  choco install git
  ```

  After installing Git, you may need to disable `core.autocrlf` to prevent line ending issues.

  ```sh
  git config --local core.autocrlf false
  ```

- Install [CMake](https://cmake.org/download/)

  CMake does not add itself to the system path by default, so you'll need specify the `ADD_CMAKE_TO_PATH` argument.

  ```sh
  choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System'
  ```

- Install [Visual Studio 2022](https://visualstudio.microsoft.com/downloads/)

  ```sh
  choco install visualstudio2022community
  ```

> [!WARNING]
> This next step will likely take a long time.
> Make sure to restart your computer once it is finished.

- Install [Visual C++ build tools workload for Visual Studio 2022](https://community.chocolatey.org/packages/visualstudio2022-workload-vctools)

  ```sh
  choco install visualstudio2022-workload-vctools
  ```

- Install [Node.js](https://nodejs.org/en/download/)

  If you have multiple node version installed and/or use a node version manager you should install a Node how you normally would.

  If you are using [nvm for windows](https://github.com/coreybutler/nvm-windows) you will need to run `nvm install <version>` and `nvm use <version>` as it doesn't support `.nvmrc` files.

  You can get the current `<version>` from the [`.nvmrc`](.nvmrc).

  ```sh
  choco install nodejs --version <version>
  ```

- Install [Python](https://www.python.org/downloads/)

  You can get the current `<version>` from the [`.tool-versions`](.tool-versions).

  ```sh
  choco install python --version <version>
  ```

- Install [setuptools](https://pypi.org/project/setuptools/)

  ```sh
  pip install setuptools
  ```

- Install [Yarn Classic](https://classic.yarnpkg.com/en/docs/install/#windows-stable)

  ```sh
  npm install --global yarn
  ```

  You'll likely encounter an issue with windows preventing you from running scripts when you run the `yarn` command, See: [Exclusion Policies](https:/go.microsoft.com/fwlink/?LinkID=135170). If you do, you can fix it by running the following command:

  ```PowerShell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### All platforms

Now, run these commands in your preferred terminal in a good directory for development:

```sh
git clone https://github.com/session-foundation/session-desktop.git
cd session-desktop
npm install --global yarn      # (only if you don’t already have `yarn`)
yarn install --frozen-lockfile # Install and build dependencies (this will take a while)
yarn build-everything
yarn test                      # A good idea to make sure tests run first
yarn start-prod                # Start Session!
```

This will build the project and start the application in production mode.

### Hot reloading

More often than not, you'll need to restart the application regularly to see your changes, as there
is no automatic restart mechanism for the entire application.

You can keep the developer tools open (`View > Toggle Developer Tools`) and press <kbd>Cmd</kbd> + <kbd>R</kbd> (macOS) or <kbd>Ctrl</kbd> + <kbd>R</kbd> (Windows & Linux) to reload the application frontend.

```sh
# runs until you stop it, re-generating built assets on file changes.

# Once this command is waiting for changes, you will need to run in another terminal `yarn build:workers` to fix the "exports undefined" error on start.

# Terminal A
yarn build-everything:watch # this process will keep running until you stop it

# Terminal B
yarn build:workers

# If you change any SASS files while running "yarn build-everything:watch" it won't be detected. You will need to run the sass build command.

# Terminal B
yarn sass
```

## Multiple instances

Since there is no registration for Session, you can create as many accounts as you
can public keys. Each client however has a dedicated storage profile which is determined by the environment and instance variables.

### Profile Paths

- Linux `~/.config/`
- macOS `~/Library/Application Support/`
- Windows `%AppData%/`

This user profile folder will change directories from `[PROFILE_PATH]/Session-{environment}` to `[PROFILE_PATH]/Session-{environment}-{instance}`.

There are a few scripts which you can use:

```sh
yarn start-prod # Start production but in development mode
MULTI=1 yarn start-prod # Start another instance of production
```

For more than 2 clients, you may run the above command with `MULTI` set before them. For example, running:

```sh
MULTI=alice yarn start-prod
```

Will run the development environment with the `alice` instance and thus create a separate storage profile.

If a fixed profile is needed (in the case of tests), you can specify it using `storageProfile` in the config file. If the change is local then put it in `local-{instance}.json` otherwise put it in `default-{instance}.json` or `{env}-{instance}.json`.

Local config files will be ignored by default in git.

For example, to create an 'alice' profile locally, put a file called `local-alice.json` in the
`config` directory:

```json
{
  "storageProfile": "alice-profile"
}
```

This will then set the `userData` directory to `[PROFILE_PATH]/Session-alice-profile` when running the `alice` instance.

# Making changes

So you're in the process of preparing that pull request. Here's how to make that go
smoothly.

## Tests

Please write tests! Our testing framework is
[mocha](http://mochajs.org/) and our assertion library is
[chai](http://chaijs.com/api/assert/).

The easiest way to run all tests at once is `yarn test`.

## Committing your changes

Before a commit is accepted the staged changes will be formatted using [prettier](https://prettier.io/) and linted using [eslint](https://eslint.org/). The commit will be reverted if files are formatted or lint errors are returned.

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

Commit messages will be checked using [husky](https://typicode.github.io/husky/#/) and [commitlint](https://commitlint.js.org/).

## Pull requests

So you wanna make a pull request? Please observe the following guidelines.

- First, make sure that your `yarn ready` run passes - it's very similar to what our
  Continuous Integration servers do to test the app.
- Never use plain strings right in the source code - pull them from `messages.json`!
  You **only** need to modify the default locale
  [`_locales/en/messages.json`](_locales/en/messages.json).
  Other locales are generated automatically based on that file and then periodically
  uploaded to Crowdin for translation. If you add or change strings in messages.json
  you will need to run `yarn buid:locales-soft` this command generates updated TypeScript type definitions to ensure you aren't using a localization key which doesn't exist.
- Please do not submit pull requests for pure translation fixes. Anyone can update
  the translations at [Crowdin](https://getsession.org/translate).
- [Rebase](https://nathanleclaire.com/blog/2014/09/14/dont-be-scared-of-git-rebase/) your
  changes on the latest `unstable` branch, resolving any conflicts.
  This ensures that your changes will merge cleanly when you open your PR.
- Be sure to add and run tests!
- Make sure the diff between `unstable` and your branch contains only the
  minimal set of changes needed to implement your feature or bug fix. This will
  make it easier for the person reviewing your code to approve the changes.
  Please do not submit a PR with commented out code or unfinished features.
- Avoid meaningless or too-granular commits. If your branch contains commits like
  the lines of "Oops, reverted this change" or "Just experimenting, will
  delete this later", please [squash or rebase those changes away](https://robots.thoughtbot.com/git-interactive-rebase-squash-amend-rewriting-history).
- Don't have too few commits. If you have a complicated or long lived feature
  branch, it may make sense to break the changes up into logical atomic chunks
  to aid in the review process.
- Provide a well written and nicely formatted commit message. See [this
  link](http://chris.beams.io/posts/git-commit/)
  for some tips on formatting. As far as content, try to include in your
  summary
  1.  What you changed
  2.  Why this change was made (including git issue # if appropriate)
  3.  Any relevant technical details or motivations for your implementation
      choices that may be helpful to someone reviewing or auditing the commit
      history in the future. When in doubt, err on the side of a longer
      commit message.

Above all, spend some time with the repository. Follow the pull request template added to
your pull request description automatically. Take a look at recent approved pull requests,
see how they did things.

## Production Builds

You can build a production binary by running the following:

```sh
yarn build-everything
yarn build-release
```

The binaries will be placed inside the `release/` folder.

<details>
<summary>Linux</summary>

You can change in [package.json](./package.json) `"target": ["deb"],` to any of the [electron-builder targets](https://www.electron.build/linux#target) to build for another target.

</details>
