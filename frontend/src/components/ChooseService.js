import React from "react";
import Dropdown from 'react-dropdown';

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
					<input className="form-control" type="text" name="service" required >
					</input>
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
