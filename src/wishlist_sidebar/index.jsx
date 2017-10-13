import React from 'react';
import ReactDOM from 'react-dom';
require('./index.css');

import Messages from './messages';

/* generic error handler */
function onError(error) {
    console.log(error);
}

// Create our number formatter.
var ccyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  // the default value for minimumFractionDigits depends on the currency
  // and is usually already 2
});


function handleClick(wishlist, index) {
    // This is basically a delete operation
    // Copy, splice and set the new list if item is clicked
    const items = wishlist.state.items.slice();
    let removed_item = items.splice(index, 1)[0];

    let msg = {from: 'sidebar', subject: 'delete_data', payload: removed_item};
    let removing_data = browser.runtime.sendMessage(msg);
    removing_data.then(() => {
        wishlist.setState({items: items});
    }, onError);

}

function emitValue(value, state) {
    let payload = {value: state.value, 
        url: state.url, 
        fathom_ns: state.fathom_ns};
    let json_string = JSON.stringify(payload);
    let xhr = new XMLHttpRequest();   // new HttpRequest instance
    xhr.open("POST", "http://mockbin.com/request");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(json_string);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log(xhr.responseText);
        }
    }
}

class TitleComponent extends React.Component {
    constructor(options) {
        super();
        this.state = {
            value: options.text,
            dom_id: options.dom_id,
            className: options.className,
            url: options.url,
            fathom_ns: options.fathom_ns
        };
    }

    // this is like setState but assumes that 'this' is bound to the
    // TitleComponent object
    setAndEmitState(state, callback) {
        this.setState(state, callback);
        emitValue(state.value, this.state);
    }

    handleEdit(old_value) {
        let prev_value = old_value;

        function closure() {
            let old_value = prev_value;
            let elem = window.document.getElementById(this.state.dom_id);
            let new_value = elem.value;
            this.setAndEmitState({value: new_value}).bind(this);
        }
        return closure;
    }

    render() {
        // Create a function closure and bind `this`
        // so that we can see old and new values in the handleEdit
        // function
        let blurFunc = this.handleEdit(this.state.value).bind(this);

        return React.createElement(
            'textarea',
            {
                id: this.state.dom_id,
                type: 'text',
                value: this.state.value,
                wrap: 'hard',
                className: this.state.className,
                onBlur: blurFunc,
            },
        );
    }
}

class PriceComponent extends React.Component {
    /*
     * This whole thing is kludgey.
     * We should really flip the value to just %0d.2d
     * on edit and then reformat with dollar signs and commas
     * when the onBlur occurs.  But this is good enough for now.
     */
    constructor(options) {
        super();

        this.state = {className: options.className, 
                      value: options.value,
                      dom_id: options.dom_id,
                      url: options.url,
                      fathom_ns: options.fathom_ns,
                      isEditting: false};
    }


    handleEdit(old_value) {
        let prev_value = old_value;

        function closure() {
            let old_value = prev_value;
            let elem = window.document.getElementById(this.state.dom_id);
            let new_value = elem.value;
            this.setState({isEditting: false});
            this.setAndEmitState({value: new_value}).bind(this);
        }
        return closure;
    }

    setAndEmitState(state, callback) {
        this.setState(state, callback);
        emitValue(state.value, this.state);
    }

    handleFocus(event) {
        this.setState({isEditting: true});
    }

    changeClosure(old_value) {
        let saved_oldvalue = old_value;
        function handleChange(event) {
            let new_value = event.target.value;

            var re = /^\d+(\.\d*)?$/;
            let valid_input = re.test(new_value);
            if (valid_input) {
                this.setState({value: new_value});
            } else {
                this.setState({value: saved_oldvalue});
            }
        }
        return handleChange;
    }

    render() {
        let blurFunc = this.handleEdit(this.state.value).bind(this);

        return React.createElement(
            'input',
            {
                id: this.state.dom_id,
                type: 'text',
                className: this.state.className,
                onFocus: this.handleFocus.bind(this),
                onChange: this.changeClosure(this.state.value).bind(this),
                onBlur: blurFunc,
                value: this.state.isEditting ? this.state.value : ccyFormatter.format(this.state.value),
            },
        );
    }

}


class WishlistItem extends React.Component {
    constructor() {
        super();
    }

    render() {
        return React.createElement(
            'div',
            {className: 'box d'},
            [ 
                React.createElement(
                    'div',
                    {
                        className: 'box e delete_button',
                        onClick: () => this.props.handleClick(this.props.wishlist, this.props.item_index),
                    },
                    "X",
                ),
                React.createElement(
                    'div',
                    {
                        className: 'box f item-price'
                    },
                    React.createElement(
                        PriceComponent,
                        {
                            className: 'text_edit',
                            dom_id: `wishlist_item_price_${this.props.item_index}`,
                            value: this.props.price,
                            url: this.props.url,
                            fathom_ns: 'com.mozilla.fathom.ns.products.price',
                        },
                    )
                ),
                React.createElement(
                    'div',
                    {className: 'box g item-title'},
                    React.createElement(
                        TitleComponent,
                        {
                            text: this.props.title,
                            className: 'styled',
                            dom_id: `wishlist_item_title_${this.props.item_index}`,
                            url: this.props.url,
                            fathom_ns: 'com.mozilla.fathom.ns.products.title',
                        }
                    )
                ),
                React.createElement(
                    'div',
                    {className: 'box h item-image'},
                    React.createElement(
                        'a',
                        {href: this.props.url},
                        React.createElement(
                            'img',
                            {
                                src: this.props.image,
                                width: 100,
                                height: 100,
                            },
                        ),
                    ),
                )]
        );
    }
}

class Wishlist extends React.Component {
    constructor() {
        super();

        this.state = {items: []};

        this.registerListeners();
        this.requestRefresh();
    }

    requestRefresh() {
        browser.runtime.sendMessage(Messages.REFRESH_SIDEBAR.toJSON());
    }

    /*
     * The sidebar needs to listen for just two messages.
     *
     * Namely:
     *      refresh_all_data
     *      added_item
     */
    registerListeners() {

        // Bind currObject to 'this' so that we don't lose the scope
        var currObject = this;

        browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            if ((msg.from === 'background') && (msg.subject === 'added_item')) {
                // append the item to the internal React state
                let items = currObject.state.items.slice();
                items.push(JSON.parse(msg.payload));
                currObject.setState({items: items});
            } else if ((msg.from === 'background') && (msg.subject === 'response_refresh')) {
                // Just overwrite all the internal state in the react
                // object
                console.log("Got a refresh of all data");
                currObject.setState({items: msg.payload});
            };
        });
    }

    renderItem(i) {
        var items = this.state.items.slice();
        var wish_item = items[i];
        return React.createElement(WishlistItem,
            {
                title: wish_item.title,
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
            {className: 'wishlist wrapper'},
            itemElements
        );
    }

}

// ========================================

ReactDOM.render(React.createElement(Wishlist, null), document.getElementById('app'));
