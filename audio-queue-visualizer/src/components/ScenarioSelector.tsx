import type {
  DemoScenario,
  ScenarioId,
} from "../data/mockScenarios";

interface ScenarioSelectorProps {
  scenarios: DemoScenario[];
  selectedId: ScenarioId;
  onSelect: (id: ScenarioId) => void;
}

function ScenarioSelector({
  scenarios,
  selectedId,
  onSelect,
}: ScenarioSelectorProps) {
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === selectedId
  );

  return (
    <section
      className="scenario-panel"
      aria-labelledby="scenario-heading"
    >
      <div className="scenario-heading">
        <div>
          <p className="section-eyebrow">
            INTEGRATION TESTING
          </p>

          <h2 id="scenario-heading">
            UI Test Scenarios
          </h2>
        </div>

        <span className="scenario-demo-badge">
          Demo Mode
        </span>
      </div>

      <div
        className="scenario-options"
        role="group"
        aria-label="Choose a UI test scenario"
      >
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={
              selectedId === scenario.id
                ? "scenario-button scenario-button--active"
                : "scenario-button"
            }
            aria-pressed={selectedId === scenario.id}
            onClick={() => onSelect(scenario.id)}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <p className="scenario-description">
        {selectedScenario?.description}
      </p>
    </section>
  );
}

export default ScenarioSelector;