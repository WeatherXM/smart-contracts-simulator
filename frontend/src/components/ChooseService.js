/* eslint-disable */ 
import React from "react";
import { ethers } from "ethers";

export function ChooseService({ requestService, services = [] }) {
	const options = [
		'Weather Forecast', 'Raw Data'
	];
	const defaultOption = options[0];

	return (
		<div>
			<h3>1. Choose Service</h3>
			<form
				onSubmit={(event) => {
					event.preventDefault();

					const formData = new FormData(event.target);
					const service = formData.get("service");
					const amount = formData.get("amount");
					const selectedService = services.find(ser => ser.serviceId === service)
					const vpu = selectedService[3].toString()

					if (service && amount) {
						requestService(service, amount, vpu);
					}
				}}
			>
				<div className="form-group">
					<label>Choose Service:</label>
					
					<select name='service' className="btn btn-secondary dropdown-toggle">
						{services.map(service => (
							<option className="dropdown-item" value={service.serviceId}>{service[1]} ({ethers.utils.formatEther(service[3].toString()).toString()}$)</option>
						))}
					</select>

					{/* <input className="form-control" type="text" name="service" required >
					</input> */}
				</div>
				<div className="form-group">
					<label>Amount</label>
					<input className="form-control" type="text" name="amount" required />
				</div>
				<div className="form-group">
					<input className="btn btn-primary mr-4" type="submit" value="Request" />
				</div>
			</form>
		</div>
	);
}
