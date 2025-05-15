import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <h1>Write Your Page Content Here</h1>
          {/* Page Content / Page Routing belongs here*/}
        </main>
      </div>
    </div>
  );
}

export default App;
