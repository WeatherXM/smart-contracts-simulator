import React from "react";
import { ethers } from "ethers";
import config from "../contracts/config.json";

export function PurchasedServices({services = []}) {
  const getPaymentCurrencyName = address => {
    if(address === config.usdtAddress.toLocaleLowerCase()) {
      return 'USDT'
    } else if (address === config.tokenAddress.toLocaleLowerCase()) {
      return 'WXM'
    }
  }

  return (
		<div>
			<h3>Purchased Services</h3>
      <table class="table table-striped">
        <thead class="thead-dark">
          <tr>
            <th>Service</th>
            <th>Duration</th>
            <th>Payment Amount</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {services.map(ser => (
            <tr>
              <td>{ser.serviceId}</td>
              <td>{ser.duration}</td>
              <td>{ethers.utils.formatEther(ser.paymentAmount)} {getPaymentCurrencyName(ser.paymentCurrency)}</td>
              <td>{ser.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}