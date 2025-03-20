# DeliverUS - Group Project

## DeliverUS

You can find DeliverUS documentation at: <https://github.com/IISSI2-IS-2025>

## Introduction

This repository includes the complete backend (`DeliverUS-Backend` folder), the `customer` frontend (`DeliverUS-Frontend-Customer` folder), and the `owner` frontend (`DeliverUS-Frontend-Owner` folder). It will serve as the foundation for the group project in the continuous assessment of the course.

## Environment Setup

### a) Windows

* Open a terminal and run the command:

    ```Bash
    npm run install:all:win
    ```

### b) Linux/MacOS

* Open a terminal and run the command:

    ```Bash
    npm run install:all:bash
    ```

## Execution

### Backend

* To **recreate migrations and seeders**, open a terminal and run the command:

    ```Bash
    npm run migrate:backend
    ```

* To **start the backend**, open a terminal and run the command:

    ```Bash
    npm run start:backend
    ```

### Frontend

* To **run the `customer` frontend application**, open a new terminal and run the command:

    ```Bash
    npm run start:frontend:customer
    ```

* To **run the `owner` frontend application**, open a new terminal and run the command:

    ```Bash
    npm run start:frontend:owner
    ```

## Debugging

* To **debug the backend**, make sure **NO** instance is running, click the `Run and Debug` button on the sidebar, select `Debug Backend` from the dropdown list, and press the *Play* button.

* To **debug the frontend**, make sure there **IS** a running instance of the frontend you want to debug, click the `Run and Debug` button on the sidebar, select `Debug Frontend` from the dropdown list, and press the *Play* button.

## Testing

* To verify the proper functioning of the backend, you can run the included test suite by executing the following command:

    ```Bash
    npm run test:backend
    ```

Please note that the base project lacks the functions that need to be implemented during the group project development. As a result, if you run the automated tests on this base project, 64 tests from 2 different test suites will fail.

Once you correctly complete the backend requirements of the group project, the tests should pass successfully.

**Warning: Tests cannot be modified.**
