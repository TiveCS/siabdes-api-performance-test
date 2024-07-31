import http from "k6/http";
import { BUMDES_IDENTIFIER, BUMDES_PASSWORD } from "../data/index.js";

export function registerUsecase() {
  const payload = {
    identifier: BUMDES_IDENTIFIER,
    password: BUMDES_PASSWORD,
    bumdes: {
      name: "Bumdes Test K6",
      phone: "08123456789",
      address: {
        province: "Jawa Barat",
        regency: "Bandung",
        district: "Bojongsoang",
        village: "Cipagalo",
        postal_code: "12312",
        complete_address:
          "Jl. jalan, Ds. Cipagalo, Bojongsoang, Bandung, Jawa Barat",
      },
    },
    organization: {
      leader: "Ya Ndak Tau",
      secretary: "Ya Ndak Tau",
      treasurer: "Ya Ndak Tau",
    },
  };

  return http.post(`${__ENV.API_URL}/auth/register`, JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

/**
 *
 * @param {string} identifier
 * @param {string} password
 */
export function loginUsecase(identifier, password) {
  const payload = {
    identifier,
    password,
  };

  return http.post(`${__ENV.API_URL}/auth/login`, JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
