import './footer.css';

const Footer = () => {
    return (
        <footer className='chorder__footer'>
            <div className='chorder__footer-content'>
                <a href='https://github.com/evangipson/chorder/' target='_blank'>View the source</a>
                <p className='chorder__copyright'>©{new Date().getFullYear()} chorder</p>
            </div>
        </footer>
    );
};

export default Footer;