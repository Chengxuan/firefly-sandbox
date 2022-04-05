import { FormControl, Grid, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SELECTED_NAMESPACE } from '../../App';
import { FF_Paths } from '../../constants/FF_Paths';
import { JsonPayloadContext } from '../../contexts/JsonPayloadContext';
import { DEFAULT_SPACING } from '../../theme';
import * as _ from 'underscore';
import {
  DEFAULT_MESSAGE_STRING,
  MessageTypeGroup,
} from '../Buttons/MessageTypeGroup';
import { RunButton } from '../Buttons/RunButton';

export const BroadcastForm: React.FC = (props: any) => {
  const { setDisplayCodeBlock } = props;
  const { jsonPayload, setJsonPayload } = useContext(JsonPayloadContext);
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | object>(
    DEFAULT_MESSAGE_STRING
  );
  const [tag, setTag] = useState<string>();
  const [topics, setTopics] = useState<string>();

  useEffect(() => {
    const fetchCodeBlock = () => {
      return fetch(
        `${window.location.protocol}//${window.location.hostname}:3001/api/simple/template/broadcast`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          const compiled = _.template(data);
          const result = compiled({
            tag: 'test-tag',
            topic: 'test-topic',
            value: 'Hello',
          });
          setDisplayCodeBlock(result);
          console.log(result);
        })
        .catch(() => {
          return null;
        });
    };
    fetchCodeBlock();
  }, []);

  useEffect(() => {
    setJsonPayload({
      topic: topics,
      tag: tag,
      value: message,
    });
  }, [message, tag, topics]);

  const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 0) {
      setTag(undefined);
      return;
    }
    setTag(event.target.value);
  };

  const handleTopicsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 0) {
      setTopics(undefined);
      return;
    }
    setTopics(event.target.value);
  };

  return (
    <Grid width={'100%'} container>
      <FormControl>
        <Grid container spacing={DEFAULT_SPACING}>
          {/* Message */}
          <MessageTypeGroup
            noUndefined
            message={message}
            onSetMessage={(msg: string | object) => setMessage(msg)}
          />
          <Grid container item justifyContent="space-between" spacing={1}>
            {/* Tag */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('tag')}
                placeholder={t('exampleTag')}
                onChange={handleTagChange}
              />
            </Grid>
            {/* Topic */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={t('topic')}
                placeholder={t('exampleTopic')}
                onChange={handleTopicsChange}
              />
            </Grid>
          </Grid>
          <Grid container item justifyContent="flex-end">
            <RunButton
              endpoint={`${FF_Paths.messagesBroadcast}`}
              payload={jsonPayload}
            />
          </Grid>
        </Grid>
      </FormControl>
    </Grid>
  );
};
