import 'normalize.css';
import { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// NOTE: Do not move the styles dir to the src.
// They are used by the Static CMS preview feature.
import '../../public/styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  const { asPath } = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [needNetlifyIdentityWidget, setNeedNetlifyIdentityWidget] = useState(false);
  useEffect(() => {
    // Find out if it is necessary to load netlify identity widget
    setNeedNetlifyIdentityWidget(asPath.indexOf('/#') === 0 || asPath.indexOf('/admin') === 0);
    // Find out if it is admin 
    setIsAdmin(asPath.indexOf('/admin') === 0);
    // Add netlifyIdentity in the following cases
    if (isAdmin) {
      // the user is in the admin page
      window.netlifyIdentity = require('netlify-identity-widget');
      // we want to hide the button until the widget is ready to be used. We are hiding jsx global inline CSS to hide the button (see the line around #46 down below)
      window.netlifyIdentity.on('init', (user) => {
        // We are using init event hook to show the button once again.
        const buttonElm = document.querySelector('.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium') as HTMLButtonElement;
        if (buttonElm) buttonElm.style.display = 'block';
      });
    } else if (needNetlifyIdentityWidget) {
      // the user is not in the admin page but netlify-identity-widget is needed.
      window.netlifyIdentity = require('netlify-identity-widget');
      // redirect to the admin page after successful login
      window.netlifyIdentity.on('init', (user) => {
        if (!user) {
          window.netlifyIdentity.on('login', () => {
            document.location.href = '/admin/';
          });
        }
      });
    }
  }, [asPath, isAdmin, needNetlifyIdentityWidget]);
  return (
    <>
      {isAdmin ? (
        <>
          <Component {...pageProps} />
          <style jsx global>
            {`
              .MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium {
                display: none;
              }
            `}
          </style>
        </>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
