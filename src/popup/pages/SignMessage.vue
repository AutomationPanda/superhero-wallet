<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import { useDeepLinkApi, useModals, useSdk } from '../../composables';
import { MODAL_MESSAGE_SIGN, handleUnknownError } from '../utils';

export default defineComponent({
  name: 'SignMessage',
  setup(props, { root }) {
    onMounted(async () => {
      const { callbackOrigin, openCallbackOrGoHome } = useDeepLinkApi({ router: root.$router });
      const { getSdk } = useSdk({ store: root.$store });
      const { openModal } = useModals();

      try {
        const sdk = await getSdk();
        const { message } = root.$route.query;

        await openModal(MODAL_MESSAGE_SIGN, {
          message,
          app: {
            name: callbackOrigin.value?.host,
            host: callbackOrigin.value?.host,
            url: callbackOrigin.value?.href,
          },
        });

        const signature = await sdk.signMessage(message);
        const signatureHex = Buffer.from(signature).toString('hex');
        openCallbackOrGoHome(true, { signature: signatureHex });
      } catch (e: any) {
        openCallbackOrGoHome(false);

        if (e.message !== 'Rejected by user') handleUnknownError(e);
      }
    });
  },
  render() {
    return null as any;
  },
});
</script>
