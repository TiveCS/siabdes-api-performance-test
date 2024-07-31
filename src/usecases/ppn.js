import http from "k6/http";
import { FormData } from "../lib/formdata.js";
import { ASSETS_IMG_EVIDENCE } from "../data/index.js";
import { randomIntBetween } from "../lib/util.js";

/**
 *
 * @param {string} unitId
 * @param {string} accessToken
 */
export function createPpnTaxUsecase(unitId, accessToken) {
  const formData = new FormData();

  const evidence = http.file(ASSETS_IMG_EVIDENCE, "evidence.jpg", "image/jpeg");

  formData.append("transaction_evidence", evidence);
  formData.append("transaction_date", new Date().toISOString());
  formData.append("transaction_number", "1233522212");
  formData.append(
    "transaction_type",
    randomIntBetween(1, 2) === 1 ? "SALES" : "PURCHASE"
  );
  formData.append("given_to", "PT. Mitra Sejahtera");
  formData.append("tax_object", "NO_TAXES");
  formData.append("item_type", "GOODS");

  formData.append("object_items[0][name]", "Laptop");
  formData.append("object_items[0][quantity]", "1");
  formData.append("object_items[0][price]", "500000");
  formData.append("object_items[0][discount]", "0");
  formData.append("object_items[0][total_price]", "500000");
  formData.append("object_items[0][dpp]", "500000");
  formData.append("object_items[0][ppn]", "0");

  return http.post(`${__ENV.API_URL}/units/${unitId}/ppn`, formData.body(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/form-data; boundary=${formData.boundary}`,
      Accept: "application/json",
    },
  });
}

/**
 *
 * @param {string} unitId
 * @param {string} accessToken
 */
export function createUnitReportPpnUsecase(unitId, accessToken) {
  let url = `${__ENV.API_URL}/units/${unitId}/reports/ppn`;

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
export function createBumdesReportPpnUsecase(bumdesId, accessToken) {
  let url = `${__ENV.API_URL}/bumdes/${bumdesId}/reports/ppn`;

  return http.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}
