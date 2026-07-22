import React from 'react';
import DynamicForm from './DynamicForm';
import DynamicTable from './DynamicTable';
import StatCard from './StatCard';
import DynamicChart from './DynamicChart';
import DetailView from './DetailView';
import FallbackComponent from './FallbackComponent';

/**
 * Component Registry - maps type strings to React components
 * Extensible: add new components by registering them here
 */
const REGISTRY = {
  form: DynamicForm,
  table: DynamicTable,
  stat_card: StatCard,
  chart: DynamicChart,
  detail: DetailView,
};

/**
 * Resolve a component type to its React component
 * Returns FallbackComponent for unknown types (never crashes)
 */
export function resolveComponent(type) {
  return REGISTRY[type] || FallbackComponent;
}

/**
 * Render a component from config
 */
export default function RegistryRenderer({ config, ...props }) {
  if (!config || !config.type) {
    return <FallbackComponent type="undefined" reason="No component configuration provided" />;
  }

  const Component = resolveComponent(config.type);
  
  return (
    <React.Suspense fallback={
      <div className="animate-pulse bg-muted rounded-xl h-32 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading component...</span>
      </div>
    }>
      <ErrorBoundary type={config.type}>
        <Component config={config} {...props} />
      </ErrorBoundary>
    </React.Suspense>
  );
}

/**
 * Error boundary for individual components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackComponent 
          type={this.props.type} 
          reason={this.state.error?.message || 'Component crashed'} 
        />
      );
    }
    return this.props.children;
  }
}