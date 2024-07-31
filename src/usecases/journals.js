import http from "k6/http";
import {
  ACCOUNT_ID_KAS_TUNAI,
  ACCOUNT_ID_PENDAPATAN,
  ACCOUNT_ID_UTANG_TUNJANGAN,
  ASSETS_IMG_EVIDENCE,
} from "../data/index.js";
import { FormData } from "../lib/formdata.js";

/**
 * @param {string} unitId
 * @param {string} accessToken
 * @param {boolean} isPosisiKeuangan
 */
export function createJournalUsecase(unitId, accessToken, isPosisiKeuangan) {
  const formData = new FormData();

  const file = http.file(ASSETS_IMG_EVIDENCE, "evidence.jpg", "image/jpeg");

  const kasIsCredit = isPosisiKeuangan;

  formData.append("unit_id", unitId);
  formData.append(
    "description",
    `Laporan ${isPosisiKeuangan ? "Posisi Keuangan" : "Laporan Pendapatan"}`
  );
  formData.append("occurred_at", new Date().toISOString());
  formData.append("category", "GENERAL");
  formData.append("evidence", file);

  formData.append("data_transactions[0][account_id]", ACCOUNT_ID_KAS_TUNAI);
  formData.append("data_transactions[0][amount]", "100000");
  formData.append("data_transactions[0][is_credit]", `${kasIsCredit}`);

  formData.append(
    "data_transactions[1][account_id]",
    isPosisiKeuangan ? ACCOUNT_ID_UTANG_TUNJANGAN : ACCOUNT_ID_PENDAPATAN
  );
  formData.append("data_transactions[1][amount]", "100000");
  formData.append("data_transactions[1][is_credit]", `${!kasIsCredit}`);

  const payload = formData.body();

  return http.post(`${__ENV.API_URL}/units/${unitId}/journals`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "multipart/form-data; boundary=" + formData.boundary,
    },
  });
}

/**
 * @typedef {'COMMERCE' | 'SERVICES' | 'INDUSTRY'} BusinessType
 */

/**
 *
 * @param {string} unitId
 * @param {string} accessToken
 * @param {BusinessType} businessType
 */
export function createUnitReportLabaRugiUsecase(
  unitId,
  accessToken,
  businessType
) {
  const startDate = new Date(2024, 0, 1).toISOString();
  const endDate = new Date().toISOString();

  let url = `${
    __ENV.API_URL
  }/units/${unitId}/reports/income-statement/${businessType.toLowerCase()}?`;

  url += "start_occurred_at=" + startDate + "&";
  url += "end_occurred_at=" + endDate;

  return http.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

/**
 *
 * @param {string} unitId
 * @param {string} accessToken
 */
export function createUnitReportPosisiKeuanganUsecase(unitId, accessToken) {
  const startDate = new Date(2024, 0, 1).toISOString();
  const endDate = new Date().toISOString();

  let url = `${__ENV.API_URL}/units/${unitId}/reports/financial-position?`;

  url += "start_occurred_at=" + startDate + "&";
  url += "end_occurred_at=" + endDate;

  return http.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

/**
 *
 * @param {string} bumdesId
 * @param {string} accessToken
 */
export function createBumdesReportLabaRugiUsecase(bumdesId, accessToken) {
  const startDate = new Date(2024, 0, 1).toISOString();
  const endDate = new Date().toISOString();

  let url = `${__ENV.API_URL}/bumdes/${bumdesId}/reports/income-statement?`;

  url += "start_occurred_at=" + startDate + "&";
  url += "end_occurred_at=" + endDate;

  return http.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

/**
 *
 * @param {string} bumdesId
 * @param {string} accessToken
 */
export function createBumdesReportPosisiKeuanganUsecase(bumdesId, accessToken) {
  const startDate = new Date(2024, 0, 1).toISOString();
  const endDate = new Date().toISOString();

  let url = `${__ENV.API_URL}/bumdes/${bumdesId}/reports/financial-position?`;

  url += "start_occurred_at=" + startDate + "&";
  url += "end_occurred_at=" + endDate;

  return http.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}
