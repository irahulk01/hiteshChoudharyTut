import "./App.css";
import BasicProps from "./component/BasicProps";
import ChildrenProps from "./component/ChildrenProps";
import ComplexProps from "./component/ComplexProps";
import RefProps from "./component/RefProps";
import ThemeProps from "./component/ThemeProps";

function Navigation() {
  const isDark = true;
  const sections = [
    { id: "basic", label: "Basic Props", icon: "📦" },
    { id: "ref", label: "Ref Props", icon: "🔗" },
    { id: "children", label: "Children Props", icon: "👶🏽" },
    { id: "theme", label: "Theme Props", icon: "🎨" },
    { id: "complex", label: "Complex Props", icon: "🧩" },
  ];
  return (
    <nav className="sticky top-0 z-10  transition-colors ${isDark: 'bg-gray-900', !isDark: 'bg-white'}">
      <div className="flex flex-wrap gap-2 p-4 justify-center">
        {sections.map((section) => (
          <button
            key={section.id}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Navigation />
      <div className="container mx-auto px-4">
        <header className="text-xl font-bold text-center my-8">React Props Explained
          <p>A comprehensive guide to understanding React props</p>
        </header>
        <div className={`space-y-48`}>
          <div id="basic" className="scroll-mt-200">
            <BasicProps />
          </div>
          <div id="ref" className="scroll-mt-200">
            <RefProps />
          </div>
          <div id="children" className="scroll-mt-200">
            <ChildrenProps />
          </div>
          <div id="theme" className="scroll-mt-200">
            <ComplexProps />
          </div>
          <div id="theme" className="scroll-mt-200">
            <ThemeProps />
          </div>
        </div>
      </div>
hello
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
