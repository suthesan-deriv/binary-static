import React from 'react';
import Affiliate from './tac_sections/affiliate.jsx';
import API from './tac_sections/api.jsx';
import BIEL from './tac_sections/biel.jsx';
import Complaints from './tac_sections/complaints.jsx';
import ConflictsPolicy from './tac_sections/conflicts_policy.jsx';
import DepositBonus from './tac_sections/deposit_bonus.jsx';
import TAC from './tac_sections/tac.jsx';
import TradingRules from './tac_sections/trading_rules.jsx';

const Section = ({
    id,
    link_id,
    className,
    children,
}) => {
    let counter = 1;
    return (
        <div id={id || ''} className={`section ${className}`}>
            <a id={link_id}></a>
            <div className='section-content'>
                <div id={`section-${counter}`}>{children}</div>
            </div>
            counter++;
        </div>
    )
};

const TermsAndConditions = () => (
    <div className='tac-binary gr-row'>
        <div className='gr-12 gr-12-m gr-parent'>
            <Section link_id='tac'>
                <TAC />
            </Section>

            <Section link_id='trading-rules'>
                <TradingRules />
            </Section>

            <Section link_id='deposit-bonus'>
                <DepositBonus />
            </Section>

            <Section link_id='affiliate'>
                <Affiliate />
            </Section>

            <Section link_id='api'>
                <API />
            </Section>

            <Section link_id='complaints-disputes'>
                <Complaints />
            </Section>
            <Section link_id='conflicts-policy'>
                <ConflictsPolicy />
            </Section>
            <Section link_id='biel'>
                <BIEL />
            </Section>
            <Section id='tnc_accept' link_id='accept' className='tnc_accept invisible'>
                <div className='gr-9 gr-12-m gr-centered center-text'>
                    <p>{it.L('By clicking OK, you confirm that you have read and accepted Terms & Conditions.')}</p>
                    <button className='button' id='btn_accept'>{it.L('OK')}</button>
                    <p className='gr-12 error-msg center-text invisible' id='err_message'></p>
                </div>
            </Section>
        </div>
    </div>
);
export default TermsAndConditions;