export function getLogStreams(logGroup: string) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          logStreamName: '2019/10/23/[$LATEST]1aff4d83011f41fc8aff950988ecf5e4',
          creationTime: 1571836310977,
          firstEventTimestamp: 1571836311371,
          lastEventTimestamp: 1572342244000,
          lastIngestionTime: 1571836326461,
          uploadSequenceToken:
            '49597935375994420491500355005312652009924775180956332578',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/10/23/[$LATEST]1aff4d83011f41fc8aff950988ecf5e4',
          storedBytes: 1816
        },
        {
          logStreamName: '2019/10/15/[$LATEST]44f8d951ae9d4973a29098e6cf86aaf7',
          creationTime: 1571125687516,
          firstEventTimestamp: 1571125687927,
          lastEventTimestamp: 1572338644000,
          lastIngestionTime: 1571125703000,
          uploadSequenceToken:
            '49600381523661043102939259763021546554631199872176716306',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/10/15/[$LATEST]44f8d951ae9d4973a29098e6cf86aaf7',
          storedBytes: 1821
        },
        {
          logStreamName: '2019/10/04/[$LATEST]589fc4ec6c304771944e817658527b05',
          creationTime: 1570181323877,
          firstEventTimestamp: 1570181324262,
          lastEventTimestamp: 1572255918655,
          lastIngestionTime: 1570181339326,
          uploadSequenceToken:
            '49597090012123761591407355470349765319087325914899806450',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/10/04/[$LATEST]589fc4ec6c304771944e817658527b05',
          storedBytes: 1823
        },
        {
          logStreamName: '2019/10/03/[$LATEST]cfceeb746ca248098d0d0a327cb4e2f1',
          creationTime: 1570094243119,
          firstEventTimestamp: 1570094243505,
          lastEventTimestamp: 1570094243550,
          lastIngestionTime: 1570094258594,
          uploadSequenceToken:
            '49599029044591094809821243571649210985019318681024691810',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/10/03/[$LATEST]cfceeb746ca248098d0d0a327cb4e2f1',
          storedBytes: 1521
        },
        {
          logStreamName: '2019/09/28/[$LATEST]e85bb01dd01040beb04dbff5bf46f564',
          creationTime: 1569659612937,
          firstEventTimestamp: 1569659613322,
          lastEventTimestamp: 1569659615964,
          lastIngestionTime: 1569659628434,
          uploadSequenceToken:
            '49596818643565648439251131567953777927355211478703810114',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/28/[$LATEST]e85bb01dd01040beb04dbff5bf46f564',
          storedBytes: 0
        },
        {
          logStreamName: '2019/09/26/[$LATEST]f2a78ff6a6e348fbb62e4144630fe424',
          creationTime: 1569482241135,
          firstEventTimestamp: 1569482241505,
          lastEventTimestamp: 1569482241550,
          lastIngestionTime: 1569482256573,
          uploadSequenceToken:
            '49599349209342874631238154208251601718817831493445133346',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/26/[$LATEST]f2a78ff6a6e348fbb62e4144630fe424',
          storedBytes: 0
        },
        {
          logStreamName: '2019/09/26/[$LATEST]e94bf1fa77004d9b925243ebe7f19fdc',
          creationTime: 1569485075785,
          firstEventTimestamp: 1569485076157,
          lastEventTimestamp: 1569485163129,
          lastIngestionTime: 1569485178194,
          uploadSequenceToken:
            '49598368352321695879064010319080057952335576639805520450',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/26/[$LATEST]e94bf1fa77004d9b925243ebe7f19fdc',
          storedBytes: 0
        },
        {
          logStreamName: '2019/09/26/[$LATEST]dacc9c2ec19e4fd8a1153d883ca95417',
          creationTime: 1569484228618,
          firstEventTimestamp: 1569484228952,
          lastEventTimestamp: 1569484229013,
          lastIngestionTime: 1569484244068,
          uploadSequenceToken:
            '49599761767977575306905909756978082347105105466223842226',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/26/[$LATEST]dacc9c2ec19e4fd8a1153d883ca95417',
          storedBytes: 0
        },
        {
          logStreamName: '2019/09/26/[$LATEST]ae78bb2cee0443b3a0fd780336213033',
          creationTime: 1569485977817,
          firstEventTimestamp: 1569485978149,
          lastEventTimestamp: 1569486412610,
          lastIngestionTime: 1569486427717,
          uploadSequenceToken:
            '49598415130743936985271768938033271608394867378789622098',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/26/[$LATEST]ae78bb2cee0443b3a0fd780336213033',
          storedBytes: 0
        },
        {
          logStreamName: '2019/09/26/[$LATEST]9a86407ff3cb490198fe930d38aa7ac3',
          creationTime: 1569483623525,
          firstEventTimestamp: 1569483623828,
          lastEventTimestamp: 1569483623872,
          lastIngestionTime: 1569483638900,
          uploadSequenceToken:
            '49599623130711892149601418369332309162463048931029187410',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/26/[$LATEST]9a86407ff3cb490198fe930d38aa7ac3',
          storedBytes: 0
        },
        {
          logStreamName: '2019/09/26/[$LATEST]52a4b9cd0dbf4adaacba4fe2c10610e0',
          creationTime: 1569484778512,
          firstEventTimestamp: 1569484778892,
          lastEventTimestamp: 1569484845593,
          lastIngestionTime: 1569484860776,
          uploadSequenceToken:
            '49598682753155969452663611747960942523332734201784286994',
          arn:
            'arn:aws:logs:us-east-1:798099338267:log-group:/aws/lambda/backend-dev-getSignedUrl:log-stream:2019/09/26/[$LATEST]52a4b9cd0dbf4adaacba4fe2c10610e0',
          storedBytes: 0
        }
      ])
    }, 500)
  })
}

export function getLogEvents(params: {
  logStream: string
  logGroup: string
  nextToken?: string
}): Promise<{
  logEvents: {
    ingestionTime: string
    message: string
    timestamp: number
  }[]
  nextForwardToken: string
  nextBackwardToken: string
}> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        nextBackwardToken: '',
        nextForwardToken: '',
        logEvents: JSON.parse(
          atob(
            'W3sidGltZXN0YW1wIjoxNTcxODM2MzExMzcxLCJtZXNzYWdlIjoiU1RBUlQgUmVxdWVzdElkOiA1NzE1ZTRmMy0zYzNmLTQ2ZjUtODMwZS0zZWI4MTA0MzQ5YTIgVmVyc2lvbjogJExBVEVTVFxuIiwiaW5nZXN0aW9uVGltZSI6MTU3MTgzNjMxMTM5MX0seyJ0aW1lc3RhbXAiOjE1NzE4MzYzMTE0MDQsIm1lc3NhZ2UiOiIyMDE5LTEwLTIzVDEzOjExOjUxLjQwM1pcdDU3MTVlNGYzLTNjM2YtNDZmNS04MzBlLTNlYjgxMDQzNDlhMlx0SU5GT1x0U0VSVkVSTEVTU19FTlRFUlBSSVNFIHtcIm9yaWdpblwiOlwic2xzLWFnZW50XCIsXCJzY2hlbWFWZXJzaW9uXCI6XCIwLjBcIixcInRpbWVzdGFtcFwiOlwiMjAxOS0xMC0yM1QxMzoxMTo1MS40MDJaXCIsXCJyZXF1ZXN0SWRcIjpcIjU3MTVlNGYzLTNjM2YtNDZmNS04MzBlLTNlYjgxMDQzNDlhMlwiLFwidHlwZVwiOlwidHJhbnNhY3Rpb25cIixcInBheWxvYWRcIjp7XCJzY2hlbWFUeXBlXCI6XCJzLXNwYW5cIixcInNjaGVtYVZlcnNpb25cIjpcIjAuMFwiLFwib3BlcmF0aW9uTmFtZVwiOlwicy10cmFuc2FjdGlvbi1mdW5jdGlvblwiLFwic3RhcnRUaW1lXCI6XCIyMDE5LTEwLTIzVDEzOjExOjUxLjM3OFpcIixcImVuZFRpbWVcIjpcIjIwMTktMTAtMjNUMTM6MTE6NTEuNDAyWlwiLFwiZHVyYXRpb25cIjoyMi43NDE0NTgsXCJzcGFuQ29udGV4dFwiOntcInRyYWNlSWRcIjpcIjU3MTVlNGYzLTNjM2YtNDZmNS04MzBlLTNlYjgxMDQzNDlhMlwiLFwic3BhbklkXCI6XCJjYjYyY2UzMS05OThiLTQ3ZmUtYWU2NS01NmFhZDE2MDExOGVcIixcInhUcmFjZUlkXCI6XCJSb290PTEtNWRiMDUxOTYtM2M1OTBjNjY2OTliNWU1NmRiMDkzNmNhO1BhcmVudD0zMTBmNmFhZjUyYmVmMTViO1NhbXBsZWQ9MFwifSxcInRhZ3NcIjp7XCJzY2hlbWFUeXBlXCI6XCJzLXRyYW5zYWN0aW9uLWZ1bmN0aW9uXCIsXCJzY2hlbWFWZXJzaW9uXCI6XCIwLjBcIixcInRpbWVzdGFtcFwiOlwiMjAxOS0xMC0yM1QxMzoxMTo1MS4zNzhaXCIsXCJ0ZW5hbnRJZFwiOlwiZG9tYWdvamtyaXNrb3ZpY1wiLFwiYXBwbGljYXRpb25OYW1lXCI6XCJiYWNrZW5kLWFwcFwiLFwic2VydmljZU5hbWVcIjpcImJhY2tlbmRcIixcInN0YWdlTmFtZVwiOlwiZGV2XCIsXCJmdW5jdGlvbk5hbWVcIjpcImJhY2tlbmQtZGV2LWdldFNpZ25lZFVybFwiLFwidGltZW91dFwiOjYsXCJjb21wdXRlVHlwZVwiOlwiYXdzLmxhbWJkYVwiLFwiY29tcHV0ZVJ1bnRpbWVcIjpcImF3cy5sYW1iZGEubm9kZWpzLjEwLjE2LjNcIixcImNvbXB1dGVSZWdpb25cIjpcInVzLWVhc3QtMVwiLFwiY29tcHV0ZU1lbW9yeVNpemVcIjpcIjEwMjRcIixcImNvbXB1dGVNZW1vcnlVc2VkXCI6XCJ7XFxcInJzc1xcXCI6NTU5MjI2ODgsXFxcImhlYXBUb3RhbFxcXCI6MjQ3NTYyMjQsXFxcImhlYXBVc2VkXFxcIjoxODUwMDI0OCxcXFwiZXh0ZXJuYWxcXFwiOjQwMzM0NTF9XCIsXCJjb21wdXRlTWVtb3J5UGVyY2VudGFnZVVzZWRcIjoxLjc1NzgxMjUsXCJjb21wdXRlQ29udGFpbmVyVXB0aW1lXCI6MC4zNjEsXCJjb21wdXRlSXNDb2xkU3RhcnRcIjp0cnVlLFwiY29tcHV0ZUluc3RhbmNlSW52b2NhdGlvbkNvdW50XCI6MSxcImNvbXB1dGVDdXN0b21TY2hlbWFUeXBlXCI6XCJzLWNvbXB1dGUtYXdzLWxhbWJkYVwiLFwiY29tcHV0ZUN1c3RvbVNjaGVtYVZlcnNpb25cIjpcIjAuMFwiLFwiY29tcHV0ZUN1c3RvbUZ1bmN0aW9uTmFtZVwiOlwiYmFja2VuZC1kZXYtZ2V0U2lnbmVkVXJsXCIsXCJjb21wdXRlQ3VzdG9tRnVuY3Rpb25WZXJzaW9uXCI6XCIkTEFURVNUXCIsXCJjb21wdXRlQ3VzdG9tQXJuXCI6XCJhcm46YXdzOmxhbWJkYTp1cy1lYXN0LTE6Nzk4MDk5MzM4MjY3OmZ1bmN0aW9uOmJhY2tlbmQtZGV2LWdldFNpZ25lZFVybFwiLFwiY29tcHV0ZUN1c3RvbVJlZ2lvblwiOlwidXMtZWFzdC0xXCIsXCJjb21wdXRlQ3VzdG9tTWVtb3J5U2l6ZVwiOlwiMTAyNFwiLFwiY29tcHV0ZUN1c3RvbUludm9rZUlkXCI6bnVsbCxcImNvbXB1dGVDdXN0b21Bd3NSZXF1ZXN0SWRcIjpcIjU3MTVlNGYzLTNjM2YtNDZmNS04MzBlLTNlYjgxMDQzNDlhMlwiLFwiY29tcHV0ZUN1c3RvbVhUcmFjZUlkXCI6XCJSb290PTEtNWRiMDUxOTYtM2M1OTBjNjY2OTliNWU1NmRiMDkzNmNhO1BhcmVudD0zMTBmNmFhZjUyYmVmMTViO1NhbXBsZWQ9MFwiLFwiY29tcHV0ZUN1c3RvbUxvZ0dyb3VwTmFtZVwiOlwiL2F3cy9sYW1iZGEvYmFja2VuZC1kZXYtZ2V0U2lnbmVkVXJsXCIsXCJjb21wdXRlQ3VzdG9tTG9nU3RyZWFtTmFtZVwiOlwiMjAxOS8xMC8yMy9bJExBVEVTVF0xYWZmNGQ4MzAxMWY0MWZjOGFmZjk1MDk4OGVjZjVlNFwiLFwiY29tcHV0ZUN1c3RvbUVudlBsYXRmb3JtXCI6XCJsaW51eFwiLFwiY29tcHV0ZUN1c3RvbUVudkFyY2hcIjpcIng2NFwiLFwiY29tcHV0ZUN1c3RvbUVudk1lbW9yeVRvdGFsXCI6MTIxOTQ0NDczNixcImNvbXB1dGVDdXN0b21FbnZNZW1vcnlGcmVlXCI6MTAzMTM3MjgwMCxcImNvbXB1dGVDdXN0b21FbnZDcHVzXCI6XCJbe1xcXCJtb2RlbFxcXCI6XFxcIkludGVsKFIpIFhlb24oUikgUHJvY2Vzc29yIEAgMi41MEdIelxcXCIsXFxcInNwZWVkXFxcIjoyNTAwLFxcXCJ0aW1lc1xcXCI6e1xcXCJ1c2VyXFxcIjo0MzAwLFxcXCJuaWNlXFxcIjowLFxcXCJzeXNcXFwiOjMwMDAsXFxcImlkbGVcXFwiOjIwODkyMzAwLFxcXCJpcnFcXFwiOjB9fSx7XFxcIm1vZGVsXFxcIjpcXFwiSW50ZWwoUikgWGVvbihSKSBQcm9jZXNzb3IgQCAyLjUwR0h6XFxcIixcXFwic3BlZWRcXFwiOjI1MDAsXFxcInRpbWVzXFxcIjp7XFxcInVzZXJcXFwiOjIxMDAsXFxcIm5pY2VcXFwiOjAsXFxcInN5c1xcXCI6MzYwMCxcXFwiaWRsZVxcXCI6MjA4OTU3MDAsXFxcImlycVxcXCI6MH19XVwiLFwiZXZlbnRUeXBlXCI6XCJhd3MuYXBpZ2F0ZXdheS5odHRwXCIsXCJldmVudFRpbWVzdGFtcFwiOlwiMjAxOS0xMC0yM1QxMzoxMTo1MC44MzJaXCIsXCJldmVudFNvdXJjZVwiOlwiYXdzLmFwaWdhdGV3YXlcIixcImV2ZW50Q3VzdG9tU2NoZW1hVHlwZVwiOlwicy1ldmVudC1hd3MtYXBpZ2F0ZXdheS1odHRwXCIsXCJldmVudEN1c3RvbVNjaGVtYVZlcnNpb25cIjpcIjAuMFwiLFwiZXZlbnRDdXN0b21BY2NvdW50SWRcIjpcIjc5ODA5OTMzODI2N1wiLFwiZXZlbnRDdXN0b21BcGlJZFwiOlwidmM1d2p5bXJuNFwiLFwiZXZlbnRDdXN0b21SZXNvdXJjZUlkXCI6XCJpa290OGNcIixcImV2ZW50Q3VzdG9tRG9tYWluUHJlZml4XCI6XCJhcGlcIixcImV2ZW50Q3VzdG9tU3RhZ2VcIjpcImRldlwiLFwiZXZlbnRDdXN0b21Eb21haW5cIjpcImFwaS5kZXZhZHZpY2UuaW9cIixcImV2ZW50Q3VzdG9tUmVxdWVzdElkXCI6XCJjYjYyY2UzMS05OThiLTQ3ZmUtYWU2NS01NmFhZDE2MDExOGVcIixcImV2ZW50Q3VzdG9tRXh0ZW5kZWRSZXF1ZXN0SWRcIjpcIkNCR3ZsR1ZLSUFNRnY4Zz1cIixcImV2ZW50Q3VzdG9tUmVxdWVzdFRpbWVcIjpcIjIzL09jdC8yMDE5OjEzOjExOjUwICswMDAwXCIsXCJldmVudEN1c3RvbVJlcXVlc3RUaW1lRXBvY2hcIjoxNTcxODM2MzEwODMyLFwiZXZlbnRDdXN0b21IdHRwUGF0aFwiOlwiL2dldFNpZ25lZFVybFwiLFwiZXZlbnRDdXN0b21IdHRwTWV0aG9kXCI6XCJHRVRcIixcImV2ZW50Q3VzdG9tWFRyYWNlSWRcIjpcIlJvb3Q9MS01ZGIwNTE5Ni0zYzU5MGM2NjY5OWI1ZTU2ZGIwOTM2Y2FcIixcImV2ZW50Q3VzdG9tWEZvcndhcmRlZEZvclwiOm51bGwsXCJldmVudEN1c3RvbVVzZXJBZ2VudFwiOlwiTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfMCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzc3LjAuMzg2NS4xMjAgU2FmYXJpLzUzNy4zNlwiLFwiZXJyb3JJZFwiOm51bGwsXCJlcnJvckZhdGFsXCI6bnVsbCxcImVycm9yQ3VscHJpdFwiOm51bGwsXCJlcnJvckV4Y2VwdGlvblR5cGVcIjpudWxsLFwiZXJyb3JFeGNlcHRpb25NZXNzYWdlXCI6bnVsbCxcImVycm9yRXhjZXB0aW9uU3RhY2t0cmFjZVwiOm51bGwsXCJ0cmFuc2FjdGlvbklkXCI6XCJjYjYyY2UzMS05OThiLTQ3ZmUtYWU2NS01NmFhZDE2MDExOGVcIixcImFwcFVpZFwiOlwiMG1tR3NweGRHaHN5dzNoS1ZwXCIsXCJ0ZW5hbnRVaWRcIjpcIk1zNkpMdFJIV0Y3MTFINVJ6a1wiLFwicGx1Z2luVmVyc2lvblwiOlwiMy4wLjBcIixcInRvdGFsU3BhbnNcIjowLFwidHJhY2VJZFwiOlwiNTcxNWU0ZjMtM2MzZi00NmY1LTgzMGUtM2ViODEwNDM0OWEyXCJ9LFwibG9nc1wiOnt9LFwic3BhbnNcIjpbXX19XG4iLCJpbmdlc3Rpb25UaW1lIjoxNTcxODM2MzI2NDYxfSx7InRpbWVzdGFtcCI6MTU3MTgzNjMxMTQyMiwibWVzc2FnZSI6IkVORCBSZXF1ZXN0SWQ6IDU3MTVlNGYzLTNjM2YtNDZmNS04MzBlLTNlYjgxMDQzNDlhMlxuIiwiaW5nZXN0aW9uVGltZSI6MTU3MTgzNjMyNjQ2MX0seyJ0aW1lc3RhbXAiOjE1NzE4MzYzMTE0MjIsIm1lc3NhZ2UiOiJSRVBPUlQgUmVxdWVzdElkOiA1NzE1ZTRmMy0zYzNmLTQ2ZjUtODMwZS0zZWI4MTA0MzQ5YTJcdER1cmF0aW9uOiA1MS4yOSBtc1x0QmlsbGVkIER1cmF0aW9uOiAxMDAgbXNcdE1lbW9yeSBTaXplOiAxMDI0IE1CXHRNYXggTWVtb3J5IFVzZWQ6IDEwMCBNQlx0SW5pdCBEdXJhdGlvbjogMzc2LjgxIG1zXHRcbiIsImluZ2VzdGlvblRpbWUiOjE1NzE4MzYzMjY0NjF9XQ=='
          )
        )
      })
    }, 2000)
  })
}
