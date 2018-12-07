var mdns = require('multicast-dns')()

const MDNS_SUFFIX = "_googlecast._tcp.local";
const DEBUG=true;

function getMDNSResponse(resolve, reject) {
	return new Promise(function(resolve, reject) {

		mdns.query({
			questions:[{
				name: MDNS_SUFFIX,
				type: 'PTR'
			}]
		});

		mdns.on('response', function(response) {
			// console.log('got a response packet:', response);

			response.additionals.forEach(function(found) {
			if (DEBUG) {
				console.log("===");
				console.log(found);
				console.log("===");
			}

			// check found for what we found
			if (found.name.endsWith(MDNS_SUFFIX) && found.type === 'SRV') {
				if (DEBUG) {
					console.log("Found google home **********************");
					console.log(found.data.target)
					console.log(found.data.port)
					console.log("****************************************");

					resolve(found);
				}
			}
			});

			if (DEBUG) {
				console.log("mDNS destroy");
			}

			reject();
			mdns.destroy();
		});
	});
}

getMDNSResponse().then(function(found) {
	console.log(found);
});
