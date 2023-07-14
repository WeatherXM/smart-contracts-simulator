import React from "react";
import { ethers } from "ethers";

export function PurchasedServices({services = []}) {

  console.log('file: PurchasedServices.js:6 -> services:', services)
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
              <td>{ethers.utils.formatEther(ser.paymentAmount)}</td>
              <td>{ser.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}