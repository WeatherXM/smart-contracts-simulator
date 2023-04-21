import React from "react";

export function PurchaseService({ burnTokens, tokenSymbol }) {
	return (
		<div>
			<h4>Purchase Service</h4>
			<form
				onSubmit={(event) => {
					// This function just calls the transferTokens callback with the
					// form's data.
					event.preventDefault();
					const formData = new FormData(event.target);
					burnTokens();
				}}
			>
				<div className="form-group">
					<input className="btn btn-primary" type="submit" value="Burn" />
				</div>
			</form>
		</div>
	);
}
