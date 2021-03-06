// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {browserHistory} from 'react-router/es6';
import IntegrationStore from 'stores/integration_store.jsx';
import {updateIncomingHook, loadIncomingHooks} from 'actions/integration_actions.jsx';

import AbstractIncomingWebhook from './abstract_incoming_webhook.jsx';
import TeamStore from 'stores/team_store.jsx';

export default class EditIncomingWebhook extends AbstractIncomingWebhook {
    constructor(props) {
        super(props);

        this.handleIntegrationChange = this.handleIntegrationChange.bind(this);
        this.originalIncomingHook = null;
    }

    componentDidMount() {
        IntegrationStore.addChangeListener(this.handleIntegrationChange);

        if (window.mm_config.EnableIncomingWebhooks === 'true') {
            loadIncomingHooks();
        }
    }

    componentWillUnmount() {
        IntegrationStore.removeChangeListener(this.handleIntegrationChange);
    }

    handleIntegrationChange() {
        const teamId = TeamStore.getCurrentId();

        const hooks = IntegrationStore.getIncomingWebhooks(teamId);
        const loading = !IntegrationStore.hasReceivedIncomingWebhooks(teamId);

        if (!loading) {
            this.originalIncomingHook = hooks.filter((hook) => hook.id === this.props.location.query.id)[0];

            this.setState({
                displayName: this.originalIncomingHook.display_name,
                description: this.originalIncomingHook.description,
                channelId: this.originalIncomingHook.channel_id
            });
        }
    }

    performAction(hook) {
        if (this.originalIncomingHook.id) {
            hook.id = this.originalIncomingHook.id;
        }

        updateIncomingHook(
            hook,
            () => {
                browserHistory.push(`/${this.props.team.name}/integrations/incoming_webhooks`);
            },
            (err) => {
                this.setState({
                    saving: false,
                    serverError: err.message
                });
            }
        );
    }

    header() {
        return {id: 'integrations.edit', defaultMessage: 'Edit'};
    }

    footer() {
        return {id: 'update_incoming_webhook.update', defaultMessage: 'Update'};
    }
}
