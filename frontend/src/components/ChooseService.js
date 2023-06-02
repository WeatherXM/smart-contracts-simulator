/* eslint-disable */ 
import React from "react";

export function ChooseService({ requestService, tokenSymbol }) {
	const options = [
		'Weather Forecast', 'Raw Data'
	];
	const defaultOption = options[0];

	return (
		<div>
			<h3>1. Choose Service</h3>
			<form
				onSubmit={(event) => {
					// This function just calls the transferTokens callback with the
					// form's data.
					event.preventDefault();

					
					const formData = new FormData(event.target);
					const service = formData.get("service");
					const period = formData.get("period");
					if (service && period) {
						requestService(service, period);
					}
				}}
			>
				<div className="form-group">
					<label>Choose Service:</label>
					
					<select name='service' className="btn btn-secondary dropdown-toggle">
						<option className="dropdown-item" value="Weather Forecast">Weather Forecast (0.5$/day)</option>
						<option className="dropdown-item" value="Raw Data">Raw Data (0.3$/day)</option>
						<option value="Daily Weather History" className="dropdown-item">Daily Weather History (0.35$/day)</option>
						<option value="Hourly Weather History" className="dropdown-item">Hourly Weather History (0.32$/day)</option>
						<option value="Analytics" className="dropdown-item">Analytics (0.85$/day)</option>
					</select>

					{/* <input className="form-control" type="text" name="service" required >
					</input> */}
				</div>
				<div className="form-group">
					<label>Period (in days)</label>
					<input className="form-control" type="text" name="period" required />
				</div>
				<div className="form-group">
					<input className="btn btn-primary" type="submit" value="Request" />
				</div>
			</form>
		</div>
	);
}
