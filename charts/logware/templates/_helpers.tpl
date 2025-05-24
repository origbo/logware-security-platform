{{/*
Expand the name of the chart.
*/}}
{{- define "logware.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "logware.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "logware.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "logware.labels" -}}
helm.sh/chart: {{ include "logware.chart" . }}
{{ include "logware.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "logware.selectorLabels" -}}
app.kubernetes.io/name: {{ include "logware.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Frontend fullname
*/}}
{{- define "logware.frontend.fullname" -}}
{{- printf "%s-frontend" (include "logware.fullname" .) }}
{{- end }}

{{/*
Backend fullname
*/}}
{{- define "logware.backend.fullname" -}}
{{- printf "%s-backend" (include "logware.fullname" .) }}
{{- end }}

{{/*
MongoDB fullname
*/}}
{{- define "logware.mongodb.fullname" -}}
{{- printf "%s-mongodb" (include "logware.fullname" .) }}
{{- end }}

{{/*
Elasticsearch fullname
*/}}
{{- define "logware.elasticsearch.fullname" -}}
{{- printf "%s-elasticsearch" (include "logware.fullname" .) }}
{{- end }}

{{/*
Redis fullname
*/}}
{{- define "logware.redis.fullname" -}}
{{- printf "%s-redis" (include "logware.fullname" .) }}
{{- end }}

{{/*
Prometheus fullname
*/}}
{{- define "logware.prometheus.fullname" -}}
{{- printf "%s-prometheus" (include "logware.fullname" .) }}
{{- end }}

{{/*
Grafana fullname
*/}}
{{- define "logware.grafana.fullname" -}}
{{- printf "%s-grafana" (include "logware.fullname" .) }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "logware.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "logware.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the proper Docker Image Registry Secret Names
*/}}
{{- define "logware.imagePullSecrets" -}}
{{- if .Values.global.imagePullSecrets }}
imagePullSecrets:
{{- range .Values.global.imagePullSecrets }}
  - name: {{ . }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Return the appropriate apiVersion for ingress
*/}}
{{- define "logware.ingress.apiVersion" -}}
{{- if semverCompare ">=1.19-0" .Capabilities.KubeVersion.GitVersion -}}
{{- print "networking.k8s.io/v1" -}}
{{- else -}}
{{- print "networking.k8s.io/v1beta1" -}}
{{- end -}}
{{- end -}}
