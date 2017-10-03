import React from 'react';
import ReactDOM from 'react-dom';
require('./index.css');


function handleClick(wishlist, index) {
    // This is basically a delete operation
    // Copy, splice and set the new list if item is clicked
    const items = wishlist.state.items.slice();
    items.splice(index, 1);
    wishlist.setState({items: items});
}


class WishlistItem extends React.Component {
    constructor() {
        super();
    }

    render() {
        return React.createElement(
            'li',
            null,
            React.createElement(
                'div',
                {className: 'wishlist-item'},
                [
                    React.createElement(
                        'div',
                        {
                            className: 'delete_button',
                            onClick: () => this.props.handleClick(this.props.wishlist, this.props.item_index),
                        },
                        "X",
                    ),
                    React.createElement(
                        'h3',
                        {className: 'item-description'},
                        React.createElement(
                            'a',
                            {href: this.props.url},
                            this.props.description,
                        )
                    ),
                    React.createElement(
                        'p',
                        {className: 'item-price'},
                        this.props.price,
                    ),
                    React.createElement(
                        'img',
                        {
                            src: this.props.image,
                            width: 40,
                            height: 40,
                        },
                        null,
                    ),

                ],
            )
        );
    }
}

class Wishlist extends React.Component {
    constructor() {
        super();

        this.state = {
            items: [
                {
                    description: "Vantrue N2 Dashcam",
                    price: "$200",
                    url: "https://www.amazon.ca/Vantrue-N2-Dual-Dash-Cam/dp/B01IHLKZ0I",
                    image: "https://images-na.ssl-images-amazon.com/images/I/617lYhsy%2BJL._AC_UL115_.jpg",
                },
                {
                    description: "NETGEAR Orbi Home WiFi System: AC3000 Tri Band Home Network with Router & Satellite Extender for up to 5000sqft of WiFi coverage (RBK50-100CNS)",
                    price: "$549.80",
                    url: "https://www.amazon.ca/NETGEAR-High-Performance-AC3000-Tri-Band-RBK50-100CNS/dp/B01LY964U3",
                    image: "https://images-na.ssl-images-amazon.com/images/I/51MrEm%2BeFfL._SL1350_.jpg",
                },
            ],
        };

        // TODO: register listeners here
    }


    renderItem(i) {
        var items = this.state.items.slice();
        var wish_item = items[i];
        return React.createElement(WishlistItem,
            {
                description: wish_item.description,
                price: wish_item.price,
                url: wish_item.url,
                image: wish_item.image,
                item_index: i,
                handleClick: handleClick,
                wishlist: this,
            });
    }

    render() {
        var itemElements = [];

        for (var index in this.state.items) {
            var item = this.renderItem(index);
            itemElements.push(item);
        }

        return React.createElement(
            'div',
            { className: 'wishlist' },
            React.createElement('ul', 
                {className: 'some-list'},
                itemElements,
            )
        );
    }

}

// ========================================

ReactDOM.render(React.createElement(Wishlist, null), document.getElementById('app'));
