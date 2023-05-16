import React from "react";

export function ValidateProofOfBurn({ validateProofOfBurn, tokenSymbol }) {
	return (
		<div>
			<h3>4.Purchase Service</h3>
			<form
				onSubmit={(event) => {
					// This function just calls the transferTokens callback with the
					// form's data.
					event.preventDefault();

					
					const formData = new FormData(event.target);
					const identifier = formData.get("identifier");
					const hash = formData.get("hash");
					if (identifier && hash) {
						validateProofOfBurn(identifier, hash);
					}
				}}
			>
				<div className="form-group">
					<label>Proof-of-Burn Hash:</label>
					<input className="form-control" type="text" name="hash" required >
					</input>
				</div>
				<div className="form-group">
					<label>Purchase Order Identifier</label>
					<input className="form-control" type="text" name="identifier" required />
				</div>
				<div className="form-group">
					<input className="btn btn-primary" type="submit" value="Purchase" />
				</div>
			</form>
		</div>
	);
}
