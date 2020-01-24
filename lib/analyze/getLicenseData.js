const licenses = require("./licenses");

const getLicenseDataForDep = (ghLicense, npmLicense) => {
  let licenseData = null;
  npmLicense = npmLicense ? npmLicense.toLowerCase() : npmLicense;

  // first see if has legit github info
  if (ghLicense && ghLicense.key) {
    if (ghLicense.key in licenses) {
      licenseData = licenses[ghLicense.key];
    }
  }

  if (!licenseData) {
    // ok, let's try to see if some text matching finds something
    for (let key in licenses) {
      if (npmLicense === key) {
        licenseData = licenses[key];
        break;
      }

      let currLicenseBeingChecked = licenses[key];
      if (currLicenseBeingChecked.spdx_id.includes(npmLicense)) {
        licenseData = currLicenseBeingChecked;
        break;
      }

      if (currLicenseBeingChecked.name.includes(npmLicense)) {
        licenseData = currLicenseBeingChecked;
        break;
      }
    }
  }

  if (!licenseData) return ghLicense || npmLicense || null;

  return licenseData;
};

module.exports = getLicenseDataForDep;
