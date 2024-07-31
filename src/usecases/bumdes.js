import http from "k6/http";
import { UNIT_IDENTIFIER, UNIT_PASSWORD } from "../data/index.js";

/**
 *
 * @param {string} bumdesId
 * @param {string} accessToken
 */
export function createUnitUsecase(bumdesId, accessToken) {
  const payload = {
    name: "Unit Sagala",
    address: "Jalan Jalan",
    leader: "Budi Sagala",
    phone_number: "08123123123",
    business_type: "COMMERCE",
    credentials: {
      identifier: UNIT_IDENTIFIER,
      password: UNIT_PASSWORD,
    },
  };

  return http.post(
    `${__ENV.API_URL}/bumdes/${bumdesId}/units`,
    JSON.stringify(payload),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}
