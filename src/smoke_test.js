import http from "k6/http";
import { fail, sleep } from "k6";
import { loginUsecase, registerUsecase } from "./usecases/auth.js";
import { createUnitUsecase } from "./usecases/bumdes.js";

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,
  // A string specifying the total duration of the test run.
  duration: "5s",

  // The following section contains configuration options for execution of this
  // test script in Grafana Cloud.
  //
  // See https://grafana.com/docs/grafana-cloud/k6/get-started/run-cloud-tests-from-the-cli/
  // to learn about authoring and running k6 test scripts in Grafana k6 Cloud.
  //
  // cloud: {
  //   // The ID of the project to which the test is assigned in the k6 Cloud UI.
  //   // By default tests are executed in default project.
  //   projectID: "",
  //   // The name of the test in the k6 Cloud UI.
  //   // Test runs with the same name will be grouped.
  //   name: "smoke_test.js"
  // },

  // Uncomment this section to enable the use of Browser API in your tests.
  //
  // See https://grafana.com/docs/k6/latest/using-k6-browser/running-browser-tests/ to learn more
  // about using Browser API in your test scripts.
  //
  // scenarios: {
  //   // The scenario name appears in the result summary, tags, and so on.
  //   // You can give the scenario any name, as long as each name in the script is unique.
  //   ui: {
  //     // Executor is a mandatory parameter for browser-based tests.
  //     // Shared iterations in this case tells k6 to reuse VUs to execute iterations.
  //     //
  //     // See https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ for other executor types.
  //     executor: 'shared-iterations',
  //     options: {
  //       browser: {
  //         // This is a mandatory parameter that instructs k6 to launch and
  //         // connect to a chromium-based browser, and use it to run UI-based
  //         // tests.
  //         type: 'chromium',
  //       },
  //     },
  //   },
  // }
};

// The function that defines VU logic.
//
// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
// about authoring k6 scripts.
//
export default function () {
  /**
   * Scenario idea:
   * This test aims to test the basic functionality of the API.
   *
   * 1. Register as bumdes
   * 2. Login as bumdes
   * 3. Create new unit
   * 4. Login as unit
   * 5. Create transaction for general journal
   * 6. Create employee as permanent employee
   * 7. Create ppn taxes
   * 8. Create pph21 taxes
   * 9. Generate report for laba rugi
   * 10. Generate report for posisi keuangan
   * 11. Generate report for pph21
   * 12. Generate report for ppn
   */

  // registerUsecase();

  const loginResponse = loginUsecase();

  if (loginResponse.status !== 201) {
    fail(`Failed to login: ${loginResponse.json()}`);
  }

  const { user, backendTokens } = loginResponse.json()["data"];

  const createUnitResponse = createUnitUsecase(
    user.bumdesId,
    backendTokens.accessToken
  );

  if (createUnitResponse.status !== 201) {
    fail(`Failed to create unit: ${JSON.stringify(createUnitResponse.json())}`);
  }

  // Add an employee as permanent employee
  const employeeResponse = createEmployeeUsecase(
    user.unitId,
    backendTokens.accessToken
  );

  sleep(1);
}
