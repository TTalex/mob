<#import "template-minimal.ftl" as layout>
<@layout.registrationLayout bodyClass="oauth"; section>
    <#if section = "header">
        <#if client.name?has_content>
            <div>
                ${msg("oauthGrantTitle", client.name)}
                <span id="kc-title-identity">${client.name}</span> ?
            </div>
        <#else>
            <div>
                ${msg("oauthGrantTitle", client.clientId)}
                <span id="kc-title-identity">${client.clientId}</span> ?
            </div>
        </#if>
    <#elseif section = "form">
        <div id="kc-oauth" class="content-area">
            <div>${msg("oauthGrantRequest")}</div>

            <ul  class="${properties.kcScreenListGroup!}">
                <#if oauth.clientScopesRequested??>
                    <#list oauth.clientScopesRequested as clientScope>
                        <li>
                            <span>${advancedMsg(clientScope.consentScreenText)}</span>
                        </li>
                    </#list>
                </#if>
            </ul>

            <form id="kc-oauth-form" class="form-actions" action="${url.oauthAction}" method="POST">
                <input type="hidden" name="code" value="${oauth.code}">
                <div class="${properties.kcFormGroupClass!}">
                    <div id="kc-oauth-data-protection">
                        <div id="kc-oauth-data-protection-consultation">
                            ${msg("privateDataProtectionConsultation")}
                            <a class="link-to-chart" href="https://${properties.websiteFQDN!}/charte-protection-donnees-personnelles" alt="CGV">
                            ${msg("privateDataProtectionLinkText")}
                            </a>
                            ${msg("and")}
                            <a class="link-to-chart" href="https://${properties.websiteFQDN!}/mentions-legales-cgu" alt="CGU">
                            ${msg("privateLegalNoticeLinkText")}
                            </a>.
                        </div>
                    </div>
                    <div id="kc-form-buttons-group" class="${properties.kcFormButtonsGroupClass!}">
                        <div id="kc-form-buttons-content" class="${properties.kcFormButtonsWrapperClass!}">
                            <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}" onclick="setTrackerLinkAccount('oui')" name="accept" id="kc-login" type="submit" value="${msg("doYes")}"/>
                            <input class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}" onclick="setTrackerLinkAccount('non')" name="cancel" id="kc-cancel" type="submit" value="${msg("doNo")}"/>
                        </div>
                    </div>
                </div>
            </form>

            <div class="clearfix"></div>
        </div>
        <script type="text/javascript">
            var _paq = window._paq = window._paq || [];
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
                var u="${properties.matomoFQDN!}";
                _paq.push(['setTrackerUrl', u+'matomo.php']);
                _paq.push(['setSiteId', "${properties.siteID!}"]);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })()

            function setTrackerLinkAccount(consent){
            _paq.push(['trackEvent', 'Liaison compte', 'Liaison compte', 'Liaison de compte financeur ${client.name} : ' + consent]);
            }
;
        </script>
    </#if>
</@layout.registrationLayout>
