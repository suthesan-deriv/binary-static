import React from 'react';
import ReactDOM from 'react-dom';
import Symbols from './symbols';
// Should be remove in the future
import Defaults from './defaults';
import {getElementById} from '../../../_common/common_functions';

function scrollToPosition (element, to, duration) {
    const requestAnimationFrame = window.requestAnimationFrame ||
        function requestAnimationFrameTimeout () {
            return setTimeout(arguments[0], 10);
        }
    if (duration <= 0) {
        element.scrollTop = to;
        return;
    }
    const difference = to - element.scrollTop;
    const perTick = difference / duration * 10;
    requestAnimationFrame(() => {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollToPosition(element, to, duration - 10);
    }, 20);
}

const List = ({
    arr,
    saveRef,
    underlying,
    onUnderlyingClick
}) => (
    arr.map(([market_code, obj], idx) => (
        <div
            className='market'
            key={idx}
            id={`${market_code}_market`}
            ref={saveRef.bind(null,market_code)}
        >
            <div className='market_name'>
                {obj.name}
            </div>
            {Object.values(obj.submarkets).map((submarket, idx_2) => (
                <div className='submarket' key={idx_2}>
                    <div className='submarket_name'>
                        {submarket.name}
                    </div>
                    <div className='symbols'>
                        {Object.entries(submarket.symbols).map(([u_code, symbol]) => (
                            <div
                                className={`symbol_name ${u_code===underlying ? 'active' : ''}`}
                                key={u_code}
                                id={u_code}
                                onClick={onUnderlyingClick.bind(null, u_code, market_code)}
                            >
                                {symbol.display}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    ))
);

class Underlying extends React.Component {
    constructor (props) {
        super(props);
        const market_symbol = Defaults.get('market');
        const underlying_symbol = Defaults.get('underlying');
        this.markets = Symbols.markets();
        const markets_arr = Object.entries(this.markets);
        this.underlyings = Symbols.getAllSymbols() || {};
        this.markets_all = markets_arr.slice();
        this.state = {
            open: false,
            market: {
                symbol: market_symbol,
                name: this.markets[market_symbol].name,
            },
            underlying: {
                symbol: underlying_symbol,
                name: this.underlyings[underlying_symbol],
            },
            markets: markets_arr,
            active_market: market_symbol,
            query: '',
        };
        getElementById('underlying').value = underlying_symbol;
    }

    componentDidMount () {
        document.body.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount () {
        document.body.removeEventListener('click', this.closeDropdown);
    }

    openDropdown = () => {
        this.setState({open: true});
        this.scrollToElement(this.state.underlying.symbol, 0);
    };

    closeDropdown = () => {
        this.setState({
            open: false,
            query: '',
            markets: this.markets_all
        });
    };

    saveRef = (node) => this.wrapper_ref = node;

    handleClickOutside = (e) => {
        if(this.wrapper_ref && !this.wrapper_ref.contains(e.target)) {
            this.closeDropdown();
        }
    }

    scrollToElement = (id, duration = 120) => {
        //handleScroll is triggered automatically which sets the active market.
        const list = ReactDOM.findDOMNode(this.refs.list);
        const toOffset = document.getElementById(id).offsetTop;
        scrollToPosition(list, toOffset - list.offsetTop, duration);
    }

    handleScroll = (e) => {
        const position = e.target.scrollTop;
        const arr = []
        Object.entries(this.market_nodes).forEach(([key, node]) => {
            if (node && node.offsetTop - this.refs.list.offsetTop - 150 <= position) {
                arr.push(key);
            }
        });
        if (this.state.active_market !== arr[arr.length-1]) {
            if (position <=10) {
                this.setState({active_market: arr[0]});
            } else {
                this.setState({active_market: arr[arr.length-1]});
            }
        }
    }

    saveMarketRef = (market, node) => {
        if(!this.market_nodes) this.market_nodes = {}
        this.market_nodes[market] = node;
    }

    searchSymbols = ({target: {value: query}}) => {
        this.setState({query});
        const markets_all = this.markets_all;
        if (!query) {
            this.setState({markets: markets_all});
            return;
        }
        const filter_markets = [];
        markets_all.map(([key, market]) => {
            let found_for_market = false; // To check market contains any matching underlying.
            const filter_submarkets = {};
            Object.entries(market.submarkets).map(([key_2, submarket]) => {
                let found_for_submarket = false; // Same as found for market
                const filter_symbols = {};
                Object.entries(submarket.symbols).map(([key_3, symbol]) => {
                    const queries = query.split(' ');
                    if (
                        queries.reduce((a, b) =>
                            symbol.display.toLowerCase().includes(b.toLowerCase()) || a
                        , false)
                    ) {
                        filter_symbols[key_3] = symbol;
                        found_for_market = true;
                        found_for_submarket = true;
                    }
                });
                if (found_for_submarket) {
                    filter_submarkets[key_2] = JSON.parse(JSON.stringify(submarket));
                    filter_submarkets[key_2].symbols = filter_symbols;
                }
            });
            if (found_for_market) {
                const market_copy = JSON.parse(JSON.stringify(market));
                market_copy.submarkets = filter_submarkets;
                filter_markets.push([key, market_copy]);
            }
        });

        // nothing found
        if (!filter_markets.length) return;

        this.setState({markets: filter_markets, active_market: filter_markets[0][0]});
    }

    onUnderlyingClick = (underlying_symbol, market_symbol) => {
        Defaults.set('underlying', underlying_symbol);
        Defaults.set('market', market_symbol);
        this.setState({
            market: {
                symbol: market_symbol,
                name: this.markets[market_symbol].name,
            },
            underlying: {
                symbol: underlying_symbol,
                name: this.underlyings[underlying_symbol],
            }
        });

        // Trigger change event.
        const ele = getElementById('underlying');
        ele.value = underlying_symbol;
        const event = new Event('change');
        ele.dispatchEvent(event);

        setTimeout(this.closeDropdown, 500);
    }

    render () {
        const {active_market, markets, underlying, query} = this.state;
        return (
            <div className='markets'>
                <div
                    className='market_current'
                    onClick={this.openDropdown}
                >
                    <span className='market'>{this.state.market.name}</span>
                    <span className='underlying'>{this.state.underlying.name}</span>
                </div>
                <div
                    className={`markets_dropdown ${this.state.open ? '' : 'hidden'}`}
                    ref={this.saveRef}
                >
                    <div className='search'>
                        <input
                            type='text'
                            maxLength={20}
                            onInput={this.searchSymbols}
                            placeholder='"AUD/JPY" or "Apple"'
                            value={query}
                        />
                    </div>
                    <div className='markets_view'>
                        <div className='markets_column'>
                            {markets.map(([key, market], idx) =>
                                <div
                                    className={`market ${active_market === key ? 'active' : ''}`}
                                    key={key}
                                    onClick={this.scrollToElement.bind(null,`${key}_market`, 120)}
                                >
                                    <span className='icon'></span>
                                    <span>{market.name}</span>
                                </div>
                            )}
                        </div>
                        <div
                            className='list'
                            ref='list'
                            onScroll={this.handleScroll}
                        >
                            <List
                                arr={markets}
                                saveRef={this.saveMarketRef}
                                underlying={underlying.symbol}
                                onUnderlyingClick={this.onUnderlyingClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export const init = () => {
    ReactDOM.render(
        <Underlying market={Symbols.markets()} />,
        document.getElementById('underlying_component')
    );
};
