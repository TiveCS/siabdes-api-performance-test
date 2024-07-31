import http from "k6/http";

/**
 *
 * @param {string} unitId
 * @param {string} accessToken
 */
export function createEmployeeUsecase(unitId, accessToken) {
  const payload = {
    name: "Budi Santoso",
    gender: "MALE",
    nik: `${Math.floor(Math.random() * 10000000000)}`,
    start_working_at: new Date().toISOString(),
    npwp: `${Math.floor(Math.random() * 10000000000)}`,
    marriage_status: "MARRIED",
    children_amount: "NONE",
    employee_status: "NEW",
    employee_type: "PERMANENT_MONTHLY",
  };

  return http.post(
    `${__ENV.API_URL}/units/${unitId}/employees`,
    JSON.stringify(payload),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 *
 * @param {string} accessToken
 * @param {string} employeeId
 * @param {number} month
 */
export function createPph21TaxUsecase(accessToken, employeeId, month) {
  const payload = {
    employee_type: "PERMANENT_MONTHLY",
    employee_id: employeeId,
    period_month: month,
    period_years: 2024,
    gross_salary: {
      // Penghasilan Bruto
      salary: 15000, // Gaji
      allowance: 0, // Tunjangan
      thr: 0, // THR
      bonus: 0, // Bonus
      overtime_salary: 500, // Lembur
      assurance: 8000, // Premi Dibayar Pemberi Kerja
    },
    pph21_calculations: [
      {
        tariff_percentage: 0.15, // 5%
        amount: 15000,
        result: 2250,
      },
    ],
    result: {
      total_pph21: 2250, // Jumlah PPh21
      total_salary: 5000, // Jumlah Penghasilan
      net_receipts: 2750, // Penerimaan Bersih
    },
  };

  return http.post(`${__ENV.API_URL}/pph21`, JSON.stringify(payload), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

/**
 *
 * @param {string} unitId
 * @param {string} accessToken
 */
export function createUnitReportPph21Usecase(unitId, accessToken) {
  let url = `${__ENV.API_URL}/units/${unitId}/reports/pph21`;

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
export function createBumdesReportPph21Usecase(bumdesId, accessToken) {
  let url = `${__ENV.API_URL}/bumdes/${bumdesId}/reports/pph21`;

  return http.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}
