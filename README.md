## Getting Started

To build and test locally, first install the prerequisites and dependencies.

1. Install [NVM](https://github.com/nvm-sh/nvm#installing-and-updating) and [Yarn 1.x](https://yarnpkg.com/)
2. Update node:

```sh
nvm install
```

3. Install the dependencies

```
yarn
```

### Frontend

Running a local developent server:

```sh
yarn workspace vp-poc serve
```

Lint checks:

```sh
yarn workspace vp-poc lint
```

Build:

```sh
yarn workspace vp-poc build
```

### SIP Demo Backend

Build:

```sh
yarn workspace sip-backend build
```

Start:

```sh
cd sip-backend
node .
```
