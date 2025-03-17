import Footer from './components/footer/footer';
import Nav from './components/nav/nav';
import Sidebar from './components/sidebar/sidebar';
import AppRoutes from './routes/app-routes';

const App = () => {
  return (
    <div className='chorder'>
      <Nav />
      <main className='chorder__body'>
        <AppRoutes />
      </main>
      <Sidebar />
      <Footer />
    </div>
  )
};

export default App;
