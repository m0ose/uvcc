/*
This file is part of uvcc -- USB Video Class (UVC) device configurator.
Copyright (C) 2018 Joel Purra <https://joelpurra.com/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import assert = require("assert");

export default class CameraFactory {
	constructor(UVCControl) {
		assert.strictEqual(arguments.length, 1);
		assert.strictEqual(typeof UVCControl, "function");

		this._UVCControl = UVCControl;
	}

	async get(vendor, product, address) {
		assert.strictEqual(arguments.length, 3);
		assert(vendor === null || (typeof vendor === "number" && vendor >= 0));
		assert(product === null || (typeof product === "number" && product >= 0));
		assert(address === null || (typeof address === "number" && address >= 0));

		const constructorOptions = {
			deviceAddress: address || undefined,
			pid: product || undefined,
			vid: vendor || undefined,
		};

		try {
			const camera = new this._UVCControl(constructorOptions);

			return camera;
		} catch (error) {
			let errorMessage = null;

			// NOTE: relies on uvc-control internals.
			// NOTE: may rely on user locale.
			const guessThatUVCDeviceWasNotFound = typeof error.name === "string"
				&& error.name === "TypeError"
				&& typeof error.message === "string"
				&& error.message === "Cannot read property 'interfaces' of undefined";

			if (guessThatUVCDeviceWasNotFound) {
				// NOTE: assuming that there was no UVC device available for this configuration.
				// NOTE: basically a duplicate of both the arguments to this function and to the uvc-control constructor.
				const functionArguments = {
					address,
					product,
					vendor,
				};

				errorMessage = `Could not find UVC device. Is a compatible camera connected? ${JSON.stringify(functionArguments)}`;
			} else {
				errorMessage = `Could create uvc-control object: ${JSON.stringify(constructorOptions)}`;
			}

			errorMessage += ` (${JSON.stringify(String(error))})`;

			const wrappedError = new Error(errorMessage);
			wrappedError.innerError = error;

			throw wrappedError;
		}
	}
}
