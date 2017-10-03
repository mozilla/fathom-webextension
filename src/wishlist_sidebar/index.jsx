import React from 'react';
import ReactDOM from 'react-dom';


// Note that you can't just use
// browser.runtime.onMessage.addListener.
//
// It won't work as when a sidebar is not visible, the sidebar page
// and script is not loaded.
//
class WishlistItem extends React.Component {
    render() {
        return React.createElement('div',
            {className: "wishlist-item"},
            this.props);
    };
}

class Wishlist extends React.Component {
    constructor() {
        super();
        this.state = {
            wishlist_items: [
                { 
                    description: 'NETGEAR Orbi Home WiFi System: AC3000 Tri Band Home Network with Router & Satellite Extender for up to 5000sqft of WiFi coverage (RBK50-100CNS)',
                    image: 'https://images-na.ssl-images-amazon.com/images/I/51MrEm%2BeFfL._SX522_.jpg',
                    price: '$549.80',
                    url: 'https://www.amazon.ca/NETGEAR-High-Performance-AC3000-Tri-Band-RBK50-100CNS/dp/B01LY964U3/'
                },
                { 
                    description: 'Vantrue N2 Dual Dash Cam - 1080P FHD +HDR Front and Back Wide Angle Dual Lens 1.5" LCD In Car Dashboard Camera DVR Video Recorder with G-Sensor, Parking Mode & Super Night Vision ',
                    image: "https://images-na.ssl-images-amazon.com/images/I/617lYhsy%2BJL._SL1200_.jpg",
                    price: '$200.00',
                    url: 'https://www.amazon.ca/Vantrue-N2-Dual-Dash-Cam/dp/B01IHLKZ0I/',
                },
            ],
        }
    }

    render() {
        return React.createElement(
            'div',
            { className: 'wishlist'},
            React.createElement( 
                'div',
                React.createElement(WishlistItem, {
                    description: 'Vantrue N2 Dual Dash Cam - 1080P FHD +HDR Front and Back Wide Angle Dual Lens 1.5" LCD In Car Dashboard Camera DVR Video Recorder with G-Sensor, Parking Mode & Super Night Vision ',
                    image: "https://images-na.ssl-images-amazon.com/images/I/617lYhsy%2BJL._SL1200_.jpg",
                    price: '$200.00',
                    url: 'https://www.amazon.ca/Vantrue-N2-Dual-Dash-Cam/dp/B01IHLKZ0I/',
                })
            ),
            React.createElement( 
                'div',
                React.createElement(WishlistItem, {
                    description: 'NETGEAR Orbi Home WiFi System: AC3000 Tri Band Home Network with Router & Satellite Extender for up to 5000sqft of WiFi coverage (RBK50-100CNS)',
                    image: 'https://images-na.ssl-images-amazon.com/images/I/51MrEm%2BeFfL._SX522_.jpg',
                    price: '$549.80',
                    url: 'https://www.amazon.ca/NETGEAR-High-Performance-AC3000-Tri-Band-RBK50-100CNS/dp/B01LY964U3/'
                })
            ),
        );
    }

}

ReactDOM.render(React.createElement(Wishlist, null), document.getElementById('root'));
