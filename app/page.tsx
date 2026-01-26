'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Database,
  Cloud,
  Cpu,
  CheckCircle2,
  Loader2,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Table,
  Code,
  Box,
  Users,
  Building2,
  Layers,
  Terminal,
  RefreshCw,
  GitBranch,
  Server,
  Shield,
  Network,
  Workflow,
  Brain,
  Settings,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  processingDetails?: ProcessingDetails;
  isExpanded?: boolean;
}

interface ProcessingDetails {
  query: string;
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  sqlQuery: string;
  bapiCall: string;
  sapTables: string[];
  tcodes: string[];
  rawData: any;
  formattedResult: any;
  executionTime: number;
}

// Sample queries organized by category
const sampleQueries = [
  { query: "Show me all vendors", icon: Building2, category: "Query" },
  { query: "Show all customers", icon: Users, category: "Query" },
  { query: "What materials do we have?", icon: Box, category: "Query" },
  { query: "Show purchase orders", icon: FileText, category: "Query" },
  { query: "Check stock for Industrial Pump Motor", icon: Package, category: "Check" },
  { query: "Track shipment FDX-789456123", icon: Truck, category: "Track" },
  { query: "Create PO for Acme Industrial for 50 pumps", icon: ShoppingCart, category: "Action" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'data' | 'pipeline' | 'architecture'>('chat');
  const [currentProcessing, setCurrentProcessing] = useState<ProcessingDetails | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [sapData, setSapData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load SAP data on mount
  useEffect(() => {
    loadSAPData();
  }, []);

  const loadSAPData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setSapData(data);
    } catch (error) {
      console.error('Failed to load SAP data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    setActiveTab('pipeline');

    // Initialize pipeline steps
    const steps: PipelineStep[] = [
      { id: 1, title: 'User Query Received', status: 'active', data: query },
      { id: 2, title: 'Azure OpenAI Processing', status: 'pending', data: null },
      { id: 3, title: 'Intent Classification', status: 'pending', data: null },
      { id: 4, title: 'Entity Extraction', status: 'pending', data: null },
      { id: 5, title: 'BAPI/RFC Mapping', status: 'pending', data: null },
      { id: 6, title: 'SAP System Execution', status: 'pending', data: null },
      { id: 7, title: 'Response Generation', status: 'pending', data: null },
    ];
    setPipelineSteps([...steps]);

    // Step 1: User Input
    await delay(300);
    steps[0].status = 'complete';
    steps[1].status = 'active';
    steps[1].data = 'Sending query to Azure OpenAI GPT-4 Turbo...';
    setPipelineSteps([...steps]);

    // Step 2: Azure OpenAI
    await delay(500);
    steps[1].status = 'complete';
    steps[1].data = 'Model: gpt-4-turbo | Tokens: ~150 | Latency: 280ms';
    steps[2].status = 'active';
    setPipelineSteps([...steps]);

    // Call API while showing animation
    const response = await fetch('/api/process-detailed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();

    const processingDetails: ProcessingDetails = {
      query,
      intent: data.intent?.name || 'UNKNOWN',
      confidence: data.intent?.confidence || 0,
      entities: data.intent?.entities || {},
      sqlQuery: data.sqlQuery || '',
      bapiCall: data.bapiCall || '',
      sapTables: data.intent?.sapOperation?.tables || [],
      tcodes: data.intent?.sapOperation?.tcodes || [],
      rawData: data.rawData,
      formattedResult: data.result,
      executionTime: data.executionTime || 0,
    };

    // Step 3: Intent Classification
    steps[2].status = 'complete';
    steps[2].data = {
      intent: processingDetails.intent,
      confidence: processingDetails.confidence,
    };
    steps[3].status = 'active';
    setPipelineSteps([...steps]);
    await delay(300);

    // Step 4: Entity Extraction
    steps[3].status = 'complete';
    steps[3].data = processingDetails.entities;
    steps[4].status = 'active';
    setPipelineSteps([...steps]);
    await delay(400);

    // Step 5: BAPI Mapping
    steps[4].status = 'complete';
    steps[4].data = {
      bapi: processingDetails.bapiCall,
      tables: processingDetails.sapTables,
      tcodes: processingDetails.tcodes,
    };
    steps[5].status = 'active';
    setPipelineSteps([...steps]);
    await delay(500);

    // Step 6: SAP Execution
    steps[5].status = 'complete';
    steps[5].data = {
      sql: processingDetails.sqlQuery,
      rowsAffected: Array.isArray(processingDetails.rawData) ? processingDetails.rawData.length : 1,
    };
    steps[6].status = 'active';
    setPipelineSteps([...steps]);
    await delay(300);

    // Step 7: Complete
    steps[6].status = 'complete';
    steps[6].data = {
      message: data.message,
      executionTime: processingDetails.executionTime,
    };
    setPipelineSteps([...steps]);

    setCurrentProcessing(processingDetails);

    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: data.message || 'Operation completed.',
      timestamp: new Date(),
      processingDetails,
      isExpanded: false,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
    loadSAPData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');

    await processQuery(query);
  };

  const handleSampleQuery = async (query: string) => {
    if (isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    await processQuery(query);
  };

  const toggleMessageExpand = (messageId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isExpanded: !m.isExpanded } : m
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1a]">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <div className="bg-[#F25022]"></div>
                <div className="bg-[#7FBA00]"></div>
                <div className="bg-[#00A4EF]"></div>
                <div className="bg-[#FFB900]"></div>
              </div>
              <span className="text-white font-semibold text-sm">Microsoft Azure</span>
            </div>
            <div className="w-px h-5 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                  SAP Copilot Demo
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">SAP Connected</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/40">PENGUIN SOLUTIONS</div>
              <div className="text-xs text-white/70">Enterprise Demo</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-[#12121f] border-b border-white/10 px-6">
        <div className="flex gap-1">
          {[
            { id: 'chat', label: 'Chat Interface', icon: MessageSquare },
            { id: 'data', label: 'Live SAP Data', icon: Database },
            { id: 'pipeline', label: 'Processing Pipeline', icon: Layers },
            { id: 'architecture', label: 'Architecture', icon: GitBranch },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                  : 'text-white/50 border-transparent hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex">
            {/* Quick Actions Sidebar */}
            <div className="w-64 border-r border-white/10 bg-[#0d0d18] p-4 flex flex-col">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSampleQuery(sq.query)}
                    disabled={isProcessing}
                    className="w-full flex items-start gap-2 p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-blue-500/30 rounded-lg transition-all text-left group"
                  >
                    <sq.icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white/70 group-hover:text-white block leading-tight">{sq.query}</span>
                      <span className="text-[10px] text-white/30 mt-0.5 block">{sq.category}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-white/10 mt-3">
                <div className="text-[10px] text-white/30 text-center">
                  Click any action or type your own query
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">SAP Copilot Assistant</h2>
                    <p className="text-white/50 text-sm mb-2 text-center max-w-md">
                      Ask questions in natural language to query SAP data, create orders, check inventory, track shipments, and more.
                    </p>
                    <p className="text-white/30 text-xs text-center max-w-sm">
                      Use the quick actions on the left or type your own query below.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white p-3'
                              : 'bg-white/10 text-white border border-white/10'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <p className="text-sm">{message.content}</p>
                          ) : (
                            <div>
                              <div className="p-3">
                                <p className="text-sm">{message.content}</p>
                              </div>
                              {message.processingDetails?.formattedResult && (
                                <div className="border-t border-white/10">
                                  <button
                                    onClick={() => toggleMessageExpand(message.id)}
                                    className="w-full px-3 py-2 flex items-center justify-between text-xs text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <Table className="w-3 h-3" />
                                      View Details
                                    </span>
                                    {message.isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                  <AnimatePresence>
                                    {message.isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="p-3 bg-black/20 border-t border-white/5">
                                          <ExpandedResult
                                            result={message.processingDetails!.formattedResult}
                                            rawData={message.processingDetails!.rawData}
                                            sqlQuery={message.processingDetails!.sqlQuery}
                                          />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isProcessing && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/10 border border-white/10 rounded-xl p-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          <span className="text-sm text-white/70">Processing query...</span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-[#12121f]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a natural language query..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !inputValue.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>

            {/* Processing Details Panel */}
            <div className="w-80 border-l border-white/10 overflow-y-auto p-4 bg-[#0d0d18]">
              {currentProcessing ? (
                <ProcessingDetailsPanel details={currentProcessing} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/30">
                  <Terminal className="w-12 h-12 mb-3" />
                  <p className="text-sm text-center">Processing details will appear here after running a query</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Live SAP Database Tables
              </h2>
              <button
                onClick={loadSAPData}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {sapData ? (
              <div className="grid grid-cols-2 gap-6">
                <DataTable
                  title="LFA1 - Vendor Master"
                  icon={Building2}
                  data={sapData.vendors}
                  columns={['lifnr', 'name1', 'ort01', 'regio']}
                  labels={['Vendor ID', 'Name', 'City', 'State']}
                />
                <DataTable
                  title="KNA1 - Customer Master"
                  icon={Users}
                  data={sapData.customers}
                  columns={['kunnr', 'name1', 'ort01', 'credit_limit']}
                  labels={['Customer ID', 'Name', 'City', 'Credit Limit']}
                  formatters={{ credit_limit: (v: number) => `$${v?.toLocaleString()}` }}
                />
                <DataTable
                  title="MARA/MAKT - Materials"
                  icon={Package}
                  data={sapData.materials}
                  columns={['matnr', 'maktx', 'labst', 'stdprice']}
                  labels={['Material ID', 'Description', 'Stock', 'Price']}
                  formatters={{ stdprice: (v: number) => `$${v?.toFixed(2)}`, labst: (v: number) => v?.toLocaleString() }}
                />
                <DataTable
                  title="EKKO/EKPO - Purchase Orders"
                  icon={ShoppingCart}
                  data={sapData.purchaseOrders}
                  columns={['ebeln', 'vendor_name', 'bedat', 'netwr']}
                  labels={['PO Number', 'Vendor', 'Date', 'Value']}
                  formatters={{ netwr: (v: number) => `$${v?.toLocaleString()}`, bedat: formatSAPDate }}
                />
                <DataTable
                  title="VBAK/VBAP - Sales Orders"
                  icon={FileText}
                  data={sapData.salesOrders}
                  columns={['vbeln', 'customer_name', 'erdat', 'netwr']}
                  labels={['SO Number', 'Customer', 'Date', 'Value']}
                  formatters={{ netwr: (v: number) => `$${v?.toLocaleString()}`, erdat: formatSAPDate }}
                />
                <DataTable
                  title="LIKP - Deliveries"
                  icon={Truck}
                  data={sapData.deliveries}
                  columns={['vbeln', 'customer_name', 'status', 'carrier']}
                  labels={['Delivery #', 'Customer', 'Status', 'Carrier']}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            )}
          </div>
        )}

        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div className="flex-1 overflow-y-auto p-6">
            <EnhancedPipelineVisualization steps={pipelineSteps} isProcessing={isProcessing} />
          </div>
        )}

        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ArchitectureDiagram />
          </div>
        )}
      </main>
    </div>
  );
}

// Pipeline Step Type
interface PipelineStep {
  id: number;
  title: string;
  status: 'pending' | 'active' | 'complete';
  data: any;
}

// Enhanced Pipeline Visualization
function EnhancedPipelineVisualization({ steps, isProcessing }: { steps: PipelineStep[], isProcessing: boolean }) {
  const defaultSteps: PipelineStep[] = [
    { id: 1, title: 'User Query Received', status: 'pending', data: null },
    { id: 2, title: 'Azure OpenAI Processing', status: 'pending', data: null },
    { id: 3, title: 'Intent Classification', status: 'pending', data: null },
    { id: 4, title: 'Entity Extraction', status: 'pending', data: null },
    { id: 5, title: 'BAPI/RFC Mapping', status: 'pending', data: null },
    { id: 6, title: 'SAP System Execution', status: 'pending', data: null },
    { id: 7, title: 'Response Generation', status: 'pending', data: null },
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;

  const stepIcons = [MessageSquare, Cloud, Brain, Settings, Code, Database, CheckCircle2];
  const stepColors = ['purple', 'blue', 'teal', 'cyan', 'yellow', 'orange', 'green'];
  const stepDescriptions = [
    'Natural language query from user interface',
    'GPT-4 Turbo processes and understands the query',
    'AI determines the user\'s intent (e.g., LIST_VENDORS, CREATE_PO)',
    'Extracts key entities (vendor names, quantities, dates)',
    'Maps intent to appropriate SAP BAPI/RFC function',
    'Executes SQL queries against SAP database tables',
    'Formats and returns results to user',
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-blue-400" />
            SAP Integration Pipeline
          </h2>
          <p className="text-sm text-white/50 mt-1">Real-time visualization of query processing flow</p>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">Processing</span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 opacity-20" />

        <div className="space-y-4">
          {displaySteps.map((step, index) => {
            const Icon = stepIcons[index];
            const color = stepColors[index];
            const description = stepDescriptions[index];

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div
                  className={`flex gap-4 p-4 rounded-xl border transition-all ${
                    step.status === 'active'
                      ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/30'
                      : step.status === 'complete'
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  {/* Step Number & Icon */}
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        step.status === 'active'
                          ? `bg-${color}-500/20 text-${color}-400`
                          : step.status === 'complete'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/30'
                      }`}
                      style={{
                        backgroundColor: step.status === 'active'
                          ? `rgba(var(--${color}-rgb), 0.2)`
                          : undefined
                      }}
                    >
                      {step.status === 'complete' ? (
                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                      ) : step.status === 'active' ? (
                        <Icon className="w-7 h-7 animate-pulse text-blue-400" />
                      ) : (
                        <Icon className="w-7 h-7" />
                      )}
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.status === 'complete' ? 'bg-green-500 text-white' :
                      step.status === 'active' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/50'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${step.status !== 'pending' ? 'text-white' : 'text-white/50'}`}>
                        {step.title}
                      </h3>
                      {step.status === 'active' && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full animate-pulse">
                          In Progress
                        </span>
                      )}
                      {step.status === 'complete' && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mb-2">{description}</p>

                    {/* Step Data */}
                    {step.data && step.status !== 'pending' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2"
                      >
                        <StepDataDisplay stepId={step.id} data={step.data} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Summary */}
      {steps.length > 0 && steps.every(s => s.status === 'complete') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">Pipeline Complete</h4>
              <p className="text-sm text-white/50">Query processed successfully through all stages</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Step Data Display Component
function StepDataDisplay({ stepId, data }: { stepId: number, data: any }) {
  if (!data) return null;

  if (typeof data === 'string') {
    return (
      <div className="bg-black/30 rounded-lg p-2 text-xs text-white/70 font-mono">
        {data}
      </div>
    );
  }

  switch (stepId) {
    case 3: // Intent Classification
      return (
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
            {data.intent}
          </span>
          <span className="text-xs text-white/50">
            Confidence: <span className="text-green-400 font-mono">{(data.confidence * 100).toFixed(1)}%</span>
          </span>
        </div>
      );
    case 4: // Entity Extraction
      if (Object.keys(data).length === 0) {
        return <span className="text-xs text-white/40">No entities extracted</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {Object.entries(data).map(([key, value]) => (
            <span key={key} className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs">
              <span className="text-white/50">{key}:</span> {String(value)}
            </span>
          ))}
        </div>
      );
    case 5: // BAPI Mapping
      return (
        <div className="space-y-2">
          {data.tables?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Tables:</span>
              <div className="flex gap-1">
                {data.tables.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-mono">{t}</span>
                ))}
              </div>
            </div>
          )}
          {data.tcodes?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">T-Codes:</span>
              <div className="flex gap-1">
                {data.tcodes.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">{t}</span>
                ))}
              </div>
            </div>
          )}
          {data.bapi && (
            <pre className="text-xs text-yellow-300/70 font-mono bg-black/30 p-2 rounded overflow-x-auto max-h-24">
              {data.bapi}
            </pre>
          )}
        </div>
      );
    case 6: // SAP Execution
      return (
        <div className="space-y-2">
          {data.sql && (
            <pre className="text-xs text-blue-300/70 font-mono bg-black/30 p-2 rounded overflow-x-auto max-h-32">
              {data.sql}
            </pre>
          )}
          {data.rowsAffected !== undefined && (
            <span className="text-xs text-white/50">
              Rows returned: <span className="text-green-400 font-mono">{data.rowsAffected}</span>
            </span>
          )}
        </div>
      );
    case 7: // Response
      return (
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/70">{data.message}</span>
          <span className="text-xs text-white/40">
            <Zap className="w-3 h-3 inline text-green-400" /> {data.executionTime}ms
          </span>
        </div>
      );
    default:
      return (
        <pre className="text-xs text-white/50 font-mono bg-black/30 p-2 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}

// Architecture Diagram Component
function ArchitectureDiagram() {
  const [selectedApproach, setSelectedApproach] = useState<'recommended' | 'alternative1' | 'alternative2'>('recommended');

  const approaches = {
    recommended: {
      title: 'Azure-Native Integration (Recommended)',
      description: 'Leverages Azure Integration Services for a fully managed, scalable solution',
      pros: ['Fully managed services', 'Native Azure security', 'Auto-scaling', 'Low latency'],
      cons: ['Azure lock-in', 'Cost at scale'],
    },
    alternative1: {
      title: 'SAP BTP Integration Suite',
      description: 'Uses SAP Business Technology Platform for integration',
      pros: ['SAP-native', 'Pre-built connectors', 'SAP support'],
      cons: ['Additional licensing', 'Complexity'],
    },
    alternative2: {
      title: 'Custom Middleware',
      description: 'Self-hosted integration layer with RFC SDK',
      pros: ['Full control', 'No vendor lock-in', 'One-time cost'],
      cons: ['Maintenance burden', 'Security responsibility'],
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-blue-400" />
          Solution Architecture
        </h2>
        <p className="text-sm text-white/50 mt-1">Agentic SAP integration architecture with Microsoft Azure</p>
      </div>

      {/* Approach Selector */}
      <div className="flex gap-2 mb-8">
        {Object.entries(approaches).map(([key, approach]) => (
          <button
            key={key}
            onClick={() => setSelectedApproach(key as any)}
            className={`flex-1 p-3 rounded-lg border text-left transition-all ${
              selectedApproach === key
                ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {key === 'recommended' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
              <span className={`text-sm font-medium ${selectedApproach === key ? 'text-white' : 'text-white/70'}`}>
                {approach.title}
              </span>
            </div>
            <p className="text-xs text-white/40">{approach.description}</p>
          </button>
        ))}
      </div>

      {/* Architecture Diagram */}
      <div className="bg-[#12121f] border border-white/10 rounded-xl p-8 mb-8">
        {selectedApproach === 'recommended' && <RecommendedArchitecture />}
        {selectedApproach === 'alternative1' && <BTPArchitecture />}
        {selectedApproach === 'alternative2' && <CustomArchitecture />}
      </div>

      {/* Pros/Cons */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Advantages
          </h4>
          <ul className="space-y-2">
            {approaches[selectedApproach].pros.map((pro, i) => (
              <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-400" />
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Considerations
          </h4>
          <ul className="space-y-2">
            {approaches[selectedApproach].cons.map((con, i) => (
              <li key={i} className="text-sm text-white/70 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-orange-400" />
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Recommended Architecture Diagram
function RecommendedArchitecture() {
  return (
    <div className="relative">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
          Azure-Native Agentic Architecture
        </span>
      </div>

      {/* Diagram */}
      <div className="flex items-start justify-between gap-4">
        {/* User Layer */}
        <div className="flex flex-col items-center">
          <ArchBox
            icon={Users}
            label="End Users"
            sublabel="Microsoft 365 / Teams"
            color="purple"
          />
          <Arrow />
          <ArchBox
            icon={MessageSquare}
            label="Microsoft Copilot"
            sublabel="Natural Language Interface"
            color="purple"
          />
        </div>

        {/* Azure Layer */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">Azure Cloud</div>
          <div className="border border-blue-500/30 rounded-xl p-4 bg-blue-500/5">
            <div className="flex flex-col items-center gap-3">
              <ArchBox
                icon={Cloud}
                label="Azure OpenAI"
                sublabel="GPT-4 Turbo"
                color="blue"
                small
              />
              <Arrow small />
              <ArchBox
                icon={Brain}
                label="AI Agent"
                sublabel="Intent & Entity Processing"
                color="teal"
                small
              />
              <Arrow small />
              <ArchBox
                icon={Workflow}
                label="Azure Logic Apps"
                sublabel="Orchestration Layer"
                color="cyan"
                small
              />
            </div>
          </div>
        </div>

        {/* Integration Layer */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">Integration</div>
          <div className="border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5">
            <div className="flex flex-col items-center gap-3">
              <ArchBox
                icon={Network}
                label="Azure API Management"
                sublabel="Gateway & Security"
                color="yellow"
                small
              />
              <Arrow small />
              <ArchBox
                icon={Server}
                label="SAP Connector"
                sublabel="On-premises Data Gateway"
                color="orange"
                small
              />
            </div>
          </div>
        </div>

        {/* SAP Layer */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">SAP Systems</div>
          <div className="border border-orange-500/30 rounded-xl p-4 bg-orange-500/5">
            <div className="flex flex-col items-center gap-3">
              <ArchBox
                icon={Database}
                label="SAP ECC/S4HANA"
                sublabel="ERP System"
                color="orange"
                small
              />
              <div className="text-xs text-white/30 my-1">BAPI / RFC / OData</div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-white/10 text-white/50 rounded text-[10px]">LFA1</span>
                <span className="px-2 py-0.5 bg-white/10 text-white/50 rounded text-[10px]">EKKO</span>
                <span className="px-2 py-0.5 bg-white/10 text-white/50 rounded text-[10px]">MARA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow Labels */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
          <span>Request Flow</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-green-500" />
          <span>Response Flow</span>
        </div>
      </div>
    </div>
  );
}

// BTP Architecture Diagram
function BTPArchitecture() {
  return (
    <div className="relative">
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-medium">
          SAP BTP Integration Suite
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col items-center">
          <ArchBox icon={Users} label="End Users" sublabel="Web / Mobile" color="purple" />
          <Arrow />
          <ArchBox icon={MessageSquare} label="Custom UI" sublabel="React / Fiori" color="purple" />
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">SAP BTP</div>
          <div className="border border-teal-500/30 rounded-xl p-4 bg-teal-500/5">
            <div className="flex flex-col items-center gap-3">
              <ArchBox icon={Cloud} label="SAP AI Core" sublabel="LLM Processing" color="teal" small />
              <Arrow small />
              <ArchBox icon={Workflow} label="Integration Suite" sublabel="Pre-built iFlows" color="teal" small />
              <Arrow small />
              <ArchBox icon={Network} label="Cloud Connector" sublabel="Secure Tunnel" color="teal" small />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">On-Premises</div>
          <ArchBox icon={Database} label="SAP ECC/S4HANA" sublabel="ERP System" color="orange" />
        </div>
      </div>
    </div>
  );
}

// Custom Middleware Architecture
function CustomArchitecture() {
  return (
    <div className="relative">
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
          Custom Middleware Solution
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col items-center">
          <ArchBox icon={Users} label="End Users" sublabel="Web Interface" color="purple" />
          <Arrow />
          <ArchBox icon={MessageSquare} label="Frontend App" sublabel="Next.js / React" color="purple" />
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">Custom Backend</div>
          <div className="border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5">
            <div className="flex flex-col items-center gap-3">
              <ArchBox icon={Server} label="API Server" sublabel="Node.js / Python" color="yellow" small />
              <Arrow small />
              <ArchBox icon={Brain} label="NLP Engine" sublabel="OpenAI API" color="yellow" small />
              <Arrow small />
              <ArchBox icon={Code} label="RFC SDK" sublabel="SAP NW RFC" color="yellow" small />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-white/40 mb-2">SAP</div>
          <ArchBox icon={Database} label="SAP System" sublabel="RFC Enabled" color="orange" />
        </div>
      </div>
    </div>
  );
}

// Architecture Box Component
function ArchBox({ icon: Icon, label, sublabel, color, small = false }: {
  icon: any;
  label: string;
  sublabel: string;
  color: string;
  small?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    teal: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
  };

  return (
    <div className={`${small ? 'p-2' : 'p-3'} rounded-lg border ${colorClasses[color]} text-center min-w-[120px]`}>
      <Icon className={`${small ? 'w-5 h-5' : 'w-6 h-6'} mx-auto mb-1`} />
      <div className={`font-medium text-white ${small ? 'text-xs' : 'text-sm'}`}>{label}</div>
      <div className={`${small ? 'text-[10px]' : 'text-xs'} text-white/40`}>{sublabel}</div>
    </div>
  );
}

// Arrow Component
function Arrow({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${small ? 'my-1' : 'my-2'}`}>
      <div className={`${small ? 'w-0.5 h-3' : 'w-0.5 h-4'} bg-gradient-to-b from-blue-500/50 to-transparent`} />
      <ChevronDown className={`${small ? 'w-3 h-3' : 'w-4 h-4'} text-blue-500/50 -mt-1`} />
    </div>
  );
}

// Data Table Component
function DataTable({
  title,
  icon: Icon,
  data,
  columns,
  labels,
  formatters = {},
}: {
  title: string;
  icon: any;
  data: any[];
  columns: string[];
  labels: string[];
  formatters?: Record<string, (v: any) => string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayData = expanded ? data : data?.slice(0, 5);

  return (
    <div className="bg-[#12121f] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-[#1a1a2e]">
        <Icon className="w-4 h-4 text-blue-400" />
        <span className="font-semibold text-white text-sm">{title}</span>
        <span className="text-xs text-white/40 ml-auto">{data?.length || 0} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-blue-500/10">
              {labels.map((label, i) => (
                <th key={i} className="px-3 py-2 text-left text-blue-400 font-semibold uppercase tracking-wider">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData?.map((row, i) => (
              <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                {columns.map((col, j) => (
                  <td key={j} className="px-3 py-2 text-white/80 font-mono">
                    {formatters[col] ? formatters[col](row[col]) : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 text-xs text-blue-400 hover:text-blue-300 border-t border-white/5 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> Show {data.length - 5} more records
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Processing Details Panel
function ProcessingDetailsPanel({ details }: { details: ProcessingDetails }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Terminal className="w-4 h-4 text-blue-400" />
        Last Query Details
      </h3>

      {/* Query */}
      <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
        <div className="text-xs text-white/50 mb-1">Original Query</div>
        <div className="text-sm text-white/90">{details.query}</div>
      </div>

      {/* Intent */}
      <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
        <div className="text-xs text-white/50 mb-1">Detected Intent</div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
            {details.intent}
          </span>
          <span className="text-xs text-white/50">
            Confidence: <span className="text-green-400">{(details.confidence * 100).toFixed(1)}%</span>
          </span>
        </div>
      </div>

      {/* Entities */}
      {Object.keys(details.entities).length > 0 && (
        <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
          <div className="text-xs text-white/50 mb-2">Extracted Entities</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(details.entities).map(([key, value]) => (
              <span key={key} className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs">
                <span className="text-white/50">{key}:</span> {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SQL Query */}
      {details.sqlQuery && (
        <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white/50">SQL Query</div>
            <button
              onClick={() => copyToClipboard(details.sqlQuery, 'sql')}
              className="text-xs text-white/30 hover:text-white/50"
            >
              {copiedField === 'sql' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <pre className="text-xs text-blue-300 font-mono bg-black/30 p-2 rounded overflow-x-auto max-h-32">
            {details.sqlQuery}
          </pre>
        </div>
      )}

      {/* BAPI Call */}
      {details.bapiCall && (
        <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white/50">BAPI/RFC Call</div>
            <button
              onClick={() => copyToClipboard(details.bapiCall, 'bapi')}
              className="text-xs text-white/30 hover:text-white/50"
            >
              {copiedField === 'bapi' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <pre className="text-xs text-yellow-300 font-mono bg-black/30 p-2 rounded overflow-x-auto max-h-24">
            {details.bapiCall}
          </pre>
        </div>
      )}

      {/* SAP Tables & T-Codes */}
      <div className="grid grid-cols-2 gap-3">
        {details.sapTables.length > 0 && (
          <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-2">SAP Tables</div>
            <div className="flex flex-wrap gap-1">
              {details.sapTables.map((table) => (
                <span key={table} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-mono">
                  {table}
                </span>
              ))}
            </div>
          </div>
        )}
        {details.tcodes.length > 0 && (
          <div className="bg-[#12121f] border border-white/10 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-2">T-Codes</div>
            <div className="flex flex-wrap gap-1">
              {details.tcodes.map((tcode) => (
                <span key={tcode} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">
                  {tcode}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Execution Time */}
      <div className="text-xs text-white/40 flex items-center gap-1 pt-2 border-t border-white/10">
        <Zap className="w-3 h-3 text-green-400" />
        Executed in {details.executionTime}ms
      </div>
    </div>
  );
}

// Expanded Result Component for Chat Messages
function ExpandedResult({ result, rawData, sqlQuery }: { result: any, rawData: any, sqlQuery: string }) {
  const [activeTab, setActiveTab] = useState<'preview' | 'data' | 'sql'>('preview');

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {['preview', 'data', 'sql'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-2 py-1 text-xs rounded ${
              activeTab === tab
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab === 'preview' ? 'Preview' : tab === 'data' ? 'Raw Data' : 'SQL Query'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'preview' && result && (
        <ResultPreview result={result} />
      )}
      {activeTab === 'data' && rawData && (
        <pre className="text-xs text-white/60 font-mono bg-black/30 p-2 rounded overflow-auto max-h-48">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      )}
      {activeTab === 'sql' && sqlQuery && (
        <pre className="text-xs text-blue-300 font-mono bg-black/30 p-2 rounded overflow-x-auto">
          {sqlQuery}
        </pre>
      )}
    </div>
  );
}

// Result Preview
function ResultPreview({ result }: { result: any }) {
  if (!result) return null;

  if (result.type === 'list' && result.items) {
    return (
      <div className="text-xs">
        <div className="bg-black/30 rounded overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-white/5 sticky top-0">
              <tr>
                {Object.keys(result.items[0] || {}).map((key) => (
                  <th key={key} className="px-2 py-1 text-left text-white/50 font-medium">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.items.map((item: any, i: number) => (
                <tr key={i} className="border-t border-white/5">
                  {Object.values(item).map((val, j) => (
                    <td key={j} className="px-2 py-1 text-white/70 font-mono truncate max-w-[150px]">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (result.type === 'stock_check') {
    return (
      <div className="flex items-center gap-2 text-xs p-2 bg-black/30 rounded">
        <Package className="w-4 h-4 text-blue-400" />
        <span className="text-white/70">{result.material}:</span>
        <span className={`font-bold ${result.available ? 'text-green-400' : 'text-red-400'}`}>
          {result.stock} {result.unit}
        </span>
        {result.available && <CheckCircle2 className="w-4 h-4 text-green-400" />}
      </div>
    );
  }

  if (result.type === 'po_created' || result.type === 'so_created') {
    return (
      <div className="flex items-center gap-2 text-xs p-2 bg-black/30 rounded">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span className="text-white/70">Document Created:</span>
        <span className="font-mono text-green-400">{result.documentNumber}</span>
        <span className="text-white/40">(${result.totalValue?.toLocaleString()})</span>
      </div>
    );
  }

  if (result.type === 'shipment_status') {
    return (
      <div className="flex items-center gap-2 text-xs p-2 bg-black/30 rounded">
        <Truck className="w-4 h-4 text-blue-400" />
        <span className="text-white/70">Status:</span>
        <span className={`font-medium ${
          result.status === 'DELIVERED' ? 'text-green-400' :
          result.status === 'IN_TRANSIT' ? 'text-blue-400' : 'text-yellow-400'
        }`}>
          {result.status}
        </span>
        <span className="text-white/40">via {result.carrier}</span>
      </div>
    );
  }

  return (
    <pre className="text-xs text-white/60 font-mono overflow-auto max-h-32 bg-black/30 p-2 rounded">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

// Utilities
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSAPDate(date: string): string {
  if (!date || date.length !== 8) return date;
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}
