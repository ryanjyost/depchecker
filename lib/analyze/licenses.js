const licenses = {
  "agpl-3.0": {
    key: "agpl-3.0",
    name: "GNU Affero General Public License v3.0",
    spdx_id: "AGPL-3.0",
    url: "https://api.github.com/licenses/agpl-3.0",
    node_id: "MDc6TGljZW5zZTE=",
    html_url: "http://choosealicense.com/licenses/agpl-3.0/",
    description:
      "Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "patent-use",
      "private-use"
    ],
    conditions: [
      "include-copyright",
      "document-changes",
      "disclose-source",
      "network-use-disclose",
      "same-license"
    ],
    limitations: ["liability", "warranty"]
  },
  "apache-2.0": {
    key: "apache-2.0",
    name: "Apache License 2.0",
    spdx_id: "Apache-2.0",
    url: "https://api.github.com/licenses/apache-2.0",
    node_id: "MDc6TGljZW5zZTI=",
    html_url: "http://choosealicense.com/licenses/apache-2.0/",
    description:
      "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "patent-use",
      "private-use"
    ],
    conditions: ["include-copyright", "document-changes"],
    limitations: ["trademark-use", "liability", "warranty"]
  },
  "bsd-2-clause": {
    key: "bsd-2-clause",
    name: `BSD 2-Clause "Simplified" License`,
    spdx_id: "BSD-2-Clause",
    url: "https://api.github.com/licenses/bsd-2-clause",
    node_id: "MDc6TGljZW5zZTQ=",
    html_url: "http://choosealicense.com/licenses/bsd-2-clause/",
    description: `A permissive license that comes in two variants, the <a href="/licenses/bsd-2-clause/">BSD 2-Clause</a> and <a href="/licenses/bsd-3-clause/">BSD 3-Clause</a>. Both have very minute differences to the MIT license.`,
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file. Replace [year] with the current year and [fullname] with the name (or names) of the copyright holders.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "private-use"
    ],
    conditions: ["include-copyright"],
    limitations: ["liability", "warranty"]
  },
  "bsd-3-clause": {
    key: "bsd-3-clause",
    name: `BSD 3-Clause "New" or "Revised" License`,
    spdx_id: "BSD-3-Clause",
    url: "https://api.github.com/licenses/bsd-3-clause",
    node_id: "MDc6TGljZW5zZTU=",
    html_url: "http://choosealicense.com/licenses/bsd-3-clause/",
    description: `A permissive license similar to the <a href="/licenses/bsd-2-clause/">BSD 2-Clause License</a>, but with a 3rd clause that prohibits others from using the name of the project or its contributors to promote derived products without written consent.`,
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file. Replace [year] with the current year and [fullname] with the name (or names) of the copyright holders. Replace [project] with the project organization, if any, that sponsors this work.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "private-use"
    ],
    conditions: ["include-copyright"],
    limitations: ["liability", "warranty"]
  },
  "epl-2.0": {
    key: "epl-2.0",
    name: "Eclipse Public License 2.0",
    spdx_id: "EPL-2.0",
    url: "https://api.github.com/licenses/epl-2.0",
    node_id: "MDc6TGljZW5zZTMy",
    html_url: "http://choosealicense.com/licenses/epl-2.0/",
    description:
      "This commercially-friendly copyleft license provides the ability to commercially license binaries; a modern royalty-free patent license grant; and the ability for linked works to use other licenses, including commercial ones.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file.",
    permissions: [
      "commercial-use",
      "distribution",
      "modifications",
      "patent-use",
      "private-use"
    ],
    conditions: ["disclose-source", "include-copyright", "same-license"],
    limitations: ["liability", "warranty"]
  },
  "gpl-2.0": {
    key: "gpl-2.0",
    name: "GNU General Public License v2.0",
    spdx_id: "GPL-2.0",
    url: "https://api.github.com/licenses/gpl-2.0",
    node_id: "MDc6TGljZW5zZTg=",
    html_url: "http://choosealicense.com/licenses/gpl-2.0/",
    description:
      "The GNU GPL is the most widely used free software license and has a strong copyleft requirement. When distributing derived works, the source code of the work must be made available under the same license. There are multiple variants of the GNU GPL, each with different requirements.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "private-use"
    ],
    conditions: [
      "include-copyright",
      "document-changes",
      "disclose-source",
      "same-license"
    ],
    limitations: ["liability", "warranty"]
  },
  "gpl-3.0": {
    key: "gpl-3.0",
    name: "GNU General Public License v3.0",
    spdx_id: "GPL-3.0",
    url: "https://api.github.com/licenses/gpl-3.0",
    node_id: "MDc6TGljZW5zZTk=",
    html_url: "http://choosealicense.com/licenses/gpl-3.0/",
    description:
      "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.",
    implementation:
      "Create a text file in the root of your source code, typically named COPYING (a GNU convention), LICENSE or LICENSE.txt. Then copy the text of the license into that file.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "patent-use",
      "private-use"
    ],
    conditions: [
      "include-copyright",
      "document-changes",
      "disclose-source",
      "same-license"
    ],
    limitations: ["liability", "warranty"]
  },
  "lgpl-2.1": {
    key: "lgpl-2.1",
    name: "GNU Lesser General Public License v2.1",
    spdx_id: "LGPL-2.1",
    url: "https://api.github.com/licenses/lgpl-2.1",
    node_id: "MDc6TGljZW5zZTEx",
    html_url: "http://choosealicense.com/licenses/lgpl-2.1/",
    description:
      "Primarily used for software libraries, the GNU LGPL requires that derived works be licensed under the same license, but works that only link to it do not fall under this restriction. There are two commonly used versions of the GNU LGPL.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "private-use"
    ],
    conditions: [
      "include-copyright",
      "disclose-source",
      "document-changes",
      "same-license--library"
    ],
    limitations: ["liability", "warranty"]
  },
  "lgpl-3.0": {
    key: "lgpl-3.0",
    name: "GNU Lesser General Public License v3.0",
    spdx_id: "LGPL-3.0",
    url: "https://api.github.com/licenses/lgpl-3.0",
    node_id: "MDc6TGljZW5zZTEy",
    html_url: "http://choosealicense.com/licenses/lgpl-3.0/",
    description: `Permissions of this copyleft license are conditioned on making available complete source code of licensed works and modifications under the same license or the GNU GPLv3. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work through interfaces provided by the licensed work may be distributed under different terms and without source code for the larger work.",
		implementation: "This license is an additional set of permissions to the <a href="/licenses/gpl-3.0">GNU GPLv3</a> license. Follow the instructions to apply the GNU GPLv3, in the root of your source code. Then add another file named COPYING.LESSER and copy the text.`,
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "patent-use",
      "private-use"
    ],
    conditions: [
      "include-copyright",
      "disclose-source",
      "document-changes",
      "same-license--library"
    ],
    limitations: ["liability", "warranty"],
    featured: false
  },
  mit: {
    key: "mit",
    name: "MIT License",
    spdx_id: "MIT",
    url: "https://api.github.com/licenses/mit",
    node_id: "MDc6TGljZW5zZTEz",
    html_url: "http://choosealicense.com/licenses/mit/",
    description:
      "A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file. Replace [year] with the current year and [fullname] with the name (or names) of the copyright holders.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "private-use"
    ],
    conditions: ["include-copyright"],
    limitations: ["liability", "warranty"],
    featured: true
  },
  "mpl-2.0": {
    key: "mpl-2.0",
    name: "Mozilla Public License 2.0",
    spdx_id: "MPL-2.0",
    url: "https://api.github.com/licenses/mpl-2.0",
    node_id: "MDc6TGljZW5zZTE0",
    html_url: "http://choosealicense.com/licenses/mpl-2.0/",
    description:
      "Permissions of this weak copyleft license are conditioned on making available source code of licensed files and modifications of those files under the same license (or in certain cases, one of the GNU licenses). Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. However, a larger work using the licensed work may be distributed under different terms and without source code for files added in the larger work.",
    implementation:
      "Create a text file (typically named LICENSE or LICENSE.txt) in the root of your source code and copy the text of the license into the file.",
    permissions: [
      "commercial-use",
      "modifications",
      "distribution",
      "patent-use",
      "private-use"
    ],
    conditions: ["disclose-source", "include-copyright", "same-license--file"],
    limitations: ["liability", "trademark-use", "warranty"]
  },
  unlicense: {
    key: "unlicense",
    name: "The Unlicense",
    spdx_id: "Unlicense",
    url: "https://api.github.com/licenses/unlicense",
    node_id: "MDc6TGljZW5zZTE1",
    html_url: "http://choosealicense.com/licenses/unlicense/",
    description:
      "A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.",
    implementation:
      "Create a text file (typically named UNLICENSE or UNLICENSE.txt) in the root of your source code and copy the text of the license disclaimer into the file.",
    permissions: [
      "private-use",
      "commercial-use",
      "modifications",
      "distribution"
    ],
    conditions: [],
    limitations: ["liability", "warranty"]
  }
};

module.exports = licenses;
