const { expect } = require("chai");
const calculateVersionsBehind = require("../../lib/analyze/calculateVersionsBehind");
const fixtures = require("../fixtures/analyze/calculateVersionsBehind");

describe("calculateVersionsBehind()", function() {
  it("should return the unknown output for gibberish inputs", function() {
    const { project, latest, output } = fixtures.gibberish;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });

  it("should return the unknown output if no args", function() {
    const { output } = fixtures.gibberish;
    expect(calculateVersionsBehind(null, null)).to.deep.equal(output);
  });

  it("should return unknown output without a project arg", function() {
    const { latest, output } = fixtures.gibberish;
    expect(calculateVersionsBehind(undefined, latest)).to.deep.equal(output);
  });

  it("should return unknown output without a latest arg", function() {
    const { project, output } = fixtures.gibberish;
    expect(calculateVersionsBehind(project, undefined)).to.deep.equal(output);
  });

  it("should return unknown output with weird patch in latest and up-to-date otherwise", function() {
    const { project, latest, output } = fixtures.badPatch;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });

  it("should return unknown output with weird patch in project and up-to-date otherwise", function() {
    const { project, latest, output } = fixtures.badPatch;
    expect(calculateVersionsBehind(latest, project)).to.deep.equal(output);
  });

  it("should return unknown output with weird patch in project and up-to-date otherwise", function() {
    const { project, latest, output } = fixtures.badPatch;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });

  it("should handle only patches behind", function() {
    const { project, latest, output } = fixtures.patchesBehind;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });

  it("should handle only minors behind", function() {
    const { project, latest, output } = fixtures.minorsBehind;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });

  it("should handle only majors behind", function() {
    const { project, latest, output } = fixtures.majorsBehind;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });

  it("should handle up to date", function() {
    const { project, latest, output } = fixtures.upToDate;
    expect(calculateVersionsBehind(project, latest)).to.deep.equal(output);
  });
});
