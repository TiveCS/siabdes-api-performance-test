import http from "k6/http";
import { check, fail, sleep } from "k6";
import { loginUsecase, registerUsecase } from "./usecases/auth.js";
import { createUnitUsecase } from "./usecases/bumdes.js";
import {
  BUMDES_IDENTIFIER,
  BUMDES_PASSWORD,
  UNIT_IDENTIFIER,
  UNIT_PASSWORD,
} from "./data/index.js";
import { createJournalUsecase } from "./usecases/journals.js";
import { createEmployeeUsecase } from "./usecases/pph21.js";

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,

  // A string specifying the total duration of the test run.
  duration: "10s",

  iterations: 1,

  thresholds: {
    // 90% of requests must finish within 2 seconds.
    http_req_duration: ["p(90) < 2000"],

    // 95% of request's checks must be successful.
    checks: ["rate>0.95"],
  },
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
   */

  registerUsecase();

  const loginBumdesResponse = loginUsecase(BUMDES_IDENTIFIER, BUMDES_PASSWORD);

  const loginBumdesCheck = check(loginBumdesResponse, {
    "status is 201": (r) => r.status === 201,
  });

  if (!loginBumdesCheck) {
    fail(`Failed to login`);
  }

  const { user: bumdesUser, backendTokens: bumdesTokens } =
    loginBumdesResponse.json()["data"];

  createUnitUsecase(bumdesUser.bumdesId, bumdesTokens.accessToken);

  const loginUnitResponse = loginUsecase(UNIT_IDENTIFIER, UNIT_PASSWORD);

  const loginUnitCheck = check(loginUnitResponse, {
    "status is 201": (r) => r.status === 201,
  });

  if (!loginUnitCheck) {
    fail(`Failed to login`);
  }

  const { user: unitUser, backendTokens: unitTokens } =
    loginUnitResponse.json()["data"];

  const journalResponse = createJournalUsecase(
    unitUser.unitId,
    unitTokens.accessToken,
    false
  );

  const journalCheck = check(journalResponse, {
    "status is 201": (r) => r.status === 201,
  });

  if (!journalCheck) {
    console.log(`Failed to create journal`);
  }

  // Add an employee as permanent employee
  const employeeResponse = createEmployeeUsecase(
    unitUser.unitId,
    unitTokens.accessToken
  );

  const employeeCheck = check(employeeResponse, {
    "status is 201": (r) => r.status === 201,
  });

  if (!employeeCheck) {
    console.log(`Failed to create employee`);
  }

  sleep(1);
}
