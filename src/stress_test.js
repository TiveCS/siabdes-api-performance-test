import { check, sleep, fail } from "k6";
import {
  BUMDES_IDENTIFIER,
  BUMDES_PASSWORD,
  UNIT_IDENTIFIER,
  UNIT_PASSWORD,
} from "./data/index.js";
import { loginUsecase } from "./usecases/auth.js";
import {
  createBumdesReportLabaRugiUsecase,
  createBumdesReportPosisiKeuanganUsecase,
  createUnitReportLabaRugiUsecase,
  createUnitReportPosisiKeuanganUsecase,
} from "./usecases/journals.js";
import {
  createBumdesReportPph21Usecase,
  createUnitReportPph21Usecase,
} from "./usecases/pph21.js";
import {
  createBumdesReportPpnUsecase,
  createUnitReportPpnUsecase,
} from "./usecases/ppn.js";

export const options = {
  // A number specifying the number of VUs to run concurrently.
  // vus: 1,
  // A string specifying the total duration of the test run.
  // duration: "5m",

  stages: [
    { duration: "1m", target: 100 }, // warm up
    { duration: "2m", target: 378 }, // 70% of 540 users
    { duration: "5m", target: 540 }, // peak users
    { duration: "1m", target: 0 }, //
  ],
};

// The function that defines VU logic.
//
// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
// about authoring k6 scripts.
//
export default function () {
  /**
   * Scenario idea:
   * Assuming unit is already registered, which covered in smoke-test.js.
   * There are two stages, user bumdes and unit roles. This test aims to stress with heavy compute
   * of generating reports.
   *
   * 1. All users login with same username and password as unit, so the data populated by load-test.js can be reused.
   * 2. (Unit) Get laba rugi report
   * 3. (Unit) Get posisi keuangan report
   * 4. (Unit) Create pph21 report
   * 5. (Unit) Create ppn report
   * 6. Login as bumdes
   * 7. (Bumdes) Get laba rugi report
   * 8. (Bumdes) Get posisi keuangan report
   * 9. (Bumdes) Create pph21 report
   * 10. (Bumdes) Create ppn report
   */

  const loginUnitResponse = loginUsecase(UNIT_IDENTIFIER, UNIT_PASSWORD);

  if (loginUnitResponse.status !== 201) {
    fail("Failed to login as unit");
  }

  const { user, backendTokens } = loginUnitResponse.json()["data"];

  sleep(3);

  const unitLabaRugiResponse = createUnitReportLabaRugiUsecase(
    user.unitId,
    backendTokens.accessToken,
    user.unitBusinessType
  );

  const unitLabaRugiCheck = check(unitLabaRugiResponse, {
    "status is 200": (r) => r.status === 200,
  });

  if (!unitLabaRugiCheck) {
    console.log("Failed to get unit laba rugi report");
  }

  sleep(10);

  const unitPosisiKeuanganResponse = createUnitReportPosisiKeuanganUsecase(
    user.unitId,
    backendTokens.accessToken
  );

  const unitPosisiKeuanganCheck = check(unitPosisiKeuanganResponse, {
    "status is 200": (r) => r.status === 200,
  });

  if (!unitPosisiKeuanganCheck) {
    console.log("Failed to get unit posisi keuangan report");
  }

  sleep(10);

  const unitPph21Response = createUnitReportPph21Usecase(
    user.unitId,
    backendTokens.accessToken
  );

  const unitPph21Check = check(unitPph21Response, {
    "status is 200": (r) => r.status === 200,
  });

  if (!unitPph21Check) {
    console.log("Failed to create unit pph21 report");
  }

  sleep(10);

  const unitPpnResponse = createUnitReportPpnUsecase(
    user.unitId,
    backendTokens.accessToken
  );

  const unitPpnCheck = check(unitPpnResponse, {
    "status is 200": (r) => r.status === 200,
  });

  if (!unitPpnCheck) {
    console.log("Failed to create unit ppn report");
  }

  sleep(10);

  const loginBumdesResponse = loginUsecase(BUMDES_IDENTIFIER, BUMDES_PASSWORD);

  if (loginBumdesResponse.status !== 201) {
    fail("Failed to login as bumdes");
  }

  sleep(3);

  const { user: bumdesUser, backendTokens: bumdesTokens } =
    loginBumdesResponse.json()["data"];

  const bumdesLabaRugiResponse = createBumdesReportLabaRugiUsecase(
    bumdesUser.bumdesId,
    bumdesTokens.accessToken
  );

  const bumdesLabaRugiCheck = check(bumdesLabaRugiResponse, {
    "status is 200": (r) => r.status === 200,
  });

  if (!bumdesLabaRugiCheck) {
    console.log("Failed to get bumdes laba rugi report");
  }

  sleep(10);

  const bumdesPosisiKeuanganResponse = createBumdesReportPosisiKeuanganUsecase(
    bumdesUser.bumdesId,
    bumdesTokens.accessToken
  );

  const bumdesPosisiKeuanganCheck = check(bumdesPosisiKeuanganResponse, {
    "status is 200": (r) => r.status === 200,
  });

  if (!bumdesPosisiKeuanganCheck) {
    console.log("Failed to get bumdes posisi keuangan report");
  }

  sleep(10);

  const bumdesPph21Response = createBumdesReportPph21Usecase(
    bumdesUser.bumdesId,
    bumdesTokens.accessToken
  );

  const bumdesPph21Check = check(bumdesPph21Response, {
    "status is 200": (r) => r.status === 200,
  });

  if (!bumdesPph21Check) {
    console.log("Failed to create bumdes pph21 report");
  }

  sleep(10);

  const bumdesPpnResponse = createBumdesReportPpnUsecase(
    bumdesUser.bumdesId,
    bumdesTokens.accessToken
  );

  const bumdesPpnCheck = check(bumdesPpnResponse, {
    "status is 200": (r) => r.status === 200,
  });

  if (!bumdesPpnCheck) {
    console.log("Failed to create bumdes ppn report");
  }

  sleep(1);
}
