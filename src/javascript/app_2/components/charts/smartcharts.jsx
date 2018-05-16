import React from 'react';
import { SmartChart } from '@binary-com/smartcharts';
import DAO from '../../data/dao';
import { connect } from '../../store/connect';

const subscribe = (request_object, callback) => {
    if (request_object.subscribe !== 1) return;
    DAO.subscribeTicksHistory(request_object, callback);
};

const forget = (callback, match_values) => (
    DAO.forget('ticks_history', callback, match_values)
);

const SmartCharts = () =>  (
    <React.Fragment>
        <SmartChart
            requestSubscribe={subscribe}
            requestForget={forget}
            requestAPI={DAO.sendRequest.bind(DAO)}
            onSymbolChange={(symbol) => console.log('Symbol has changed to:', symbol)}
        />
    </React.Fragment>
);

export default connect(
    ({trade}) => ({
        active_symbols: trade.active_symbols,
        initial_symbol: trade.symbol,
    })
)(SmartCharts);
